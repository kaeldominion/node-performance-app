'use client';

import { useEffect, useRef, useState } from 'react';

interface NetworkUser {
  id: number;
  name: string;
  initials: string;
  x: number;
  y: number;
  connections: number[];
}

export function NetworkVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Generate mock users with profile pictures/initials
  useEffect(() => {
    const generateUsers = (count: number = 35): NetworkUser[] => {
      const names = [
        'Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn',
        'Avery', 'Blake', 'Cameron', 'Dakota', 'Emery', 'Finley', 'Harper',
        'Hayden', 'Jamie', 'Kai', 'Logan', 'Noah', 'Parker', 'Reese', 'Sage',
        'Skyler', 'Tatum', 'River', 'Phoenix', 'Rowan', 'Sawyer', 'Zion',
        'Maya', 'Ethan', 'Luna', 'Owen', 'Ivy'
      ];
      
      const users: NetworkUser[] = [];
      const connections: number[][] = [];
      
      // Generate users with positions (avoid edges for better visibility)
      for (let i = 0; i < count; i++) {
        const name = names[i % names.length];
        const initials = name.substring(0, 2).toUpperCase();
        
        users.push({
          id: i,
          name,
          initials,
          x: 10 + Math.random() * 80, // Percentage-based, avoid edges
          y: 10 + Math.random() * 80,
          connections: [],
        });
        connections.push([]);
      }
      
      // Create connections (each user connects to 2-3 nearby users)
      users.forEach((user, i) => {
        const connectionCount = 2 + Math.floor(Math.random() * 2);
        const connected = new Set<number>();
        
        // Find nearby users to connect to
        const nearbyUsers = users
          .map((u, idx) => ({
            idx,
            distance: Math.sqrt(
              Math.pow((u.x - user.x) / 100, 2) + 
              Math.pow((u.y - user.y) / 100, 2)
            )
          }))
          .filter(u => u.idx !== i && u.distance < 0.25)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, connectionCount);
        
        nearbyUsers.forEach(({ idx }) => {
          if (!connected.has(idx) && connections[i].length < connectionCount) {
            connections[i].push(idx);
            if (!connections[idx].includes(i)) {
              connections[idx].push(i); // Bidirectional
            }
            connected.add(idx);
          }
        });
      });
      
      // Assign connections
      users.forEach((user, i) => {
        user.connections = connections[i];
      });
      
      return users;
    };

    setUsers(generateUsers(35));
  }, []);

  // Intersection Observer to only animate when visible
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: rect.width || 800, 
          height: rect.height || 500 
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] overflow-hidden"
    >
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes network-float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
        @keyframes network-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        @keyframes network-ping {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .network-float { animation: network-float 4s ease-in-out infinite; }
        .network-pulse { animation: network-pulse 3s ease-in-out infinite; }
        .network-ping { animation: network-ping 2.5s ease-in-out infinite; }
      `}} />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-node-volt/5 via-transparent to-transparent" />
      
      {/* Connection lines (SVG for efficiency) */}
      {dimensions.width > 0 && (
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.25 }}
        >
          {users.map((user) =>
            user.connections.map((targetId) => {
              const target = users[targetId];
              if (!target) return null;
              
              const x1 = (user.x / 100) * dimensions.width;
              const y1 = (user.y / 100) * dimensions.height;
              const x2 = (target.x / 100) * dimensions.width;
              const y2 = (target.y / 100) * dimensions.height;
              
              return (
                <line
                  key={`${user.id}-${targetId}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="1"
                  className={`text-node-volt ${isVisible ? 'network-pulse' : ''}`}
                  strokeDasharray="3,3"
                />
              );
            })
          )}
        </svg>
      )}

      {/* User avatars */}
      <div className="relative w-full h-full">
        {users.map((user, index) => {
          const left = `${user.x}%`;
          const top = `${user.y}%`;
          const hue = (user.id * 137.5) % 360; // Golden angle for color distribution
          
          return (
            <div
              key={user.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${isVisible ? 'network-float' : ''}`}
              style={{
                left,
                top,
                animationDelay: `${(index % 10) * 0.15}s`,
              }}
            >
              {/* Profile picture circle */}
              <div className="relative group">
                {/* Connection indicator pulse */}
                {isVisible && (
                  <div 
                    className="absolute inset-0 rounded-full bg-node-volt/20 network-ping pointer-events-none"
                    style={{
                      animationDelay: `${(index % 5) * 0.4}s`,
                    }}
                  />
                )}
                
                {/* Avatar */}
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-node-volt/20 border-2 border-node-volt/50 overflow-hidden shadow-lg transition-transform group-hover:scale-110">
                  {/* Profile picture placeholder - using gradient based on initials */}
                  <div 
                    className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, 
                        hsl(${hue}, 65%, 55%), 
                        hsl(${(hue + 40) % 360}, 65%, 45%)
                      )`,
                    }}
                  >
                    {user.initials}
                  </div>
                  
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-node-volt rounded-full border-2 border-dark shadow-sm" />
                </div>
                
                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="bg-panel thin-border rounded px-2 py-1 text-xs text-text-white shadow-lg">
                    {user.name}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Animated data packets (only 3 for performance) */}
      {isVisible && users.slice(0, 3).map((user, idx) => {
        if (user.connections.length === 0) return null;
        const target = users[user.connections[0]];
        if (!target) return null;
        
        const startX = user.x;
        const startY = user.y;
        const endX = target.x;
        const endY = target.y;
        const duration = 4;
        const delay = idx * 1.3;
        
        return (
          <div
            key={`packet-${user.id}`}
            className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-node-volt rounded-full pointer-events-none"
            style={{
              left: `${startX}%`,
              top: `${startY}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 6px rgba(204, 255, 0, 0.9)',
              animation: `move-packet-${idx} ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes move-packet-${idx} {
                0% {
                  left: ${startX}%;
                  top: ${startY}%;
                  opacity: 1;
                }
                100% {
                  left: ${endX}%;
                  top: ${endY}%;
                  opacity: 0;
                }
              }
            `}} />
          </div>
        );
      })}
    </div>
  );
}
