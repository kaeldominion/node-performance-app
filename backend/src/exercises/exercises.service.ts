import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import OpenAI from 'openai';

@Injectable()
export class ExercisesService {
  private openai: OpenAI;
  
  constructor(private prisma: PrismaService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        timeout: 120000,
      });
    }
  }

  async findAll() {
    return this.prisma.exercise.findMany({
      include: {
        tiers: {
          orderBy: { tier: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      include: {
        tiers: {
          orderBy: { tier: 'asc' },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    return exercise;
  }

  async findByExerciseId(exerciseId: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { exerciseId },
      include: {
        tiers: {
          orderBy: { tier: 'asc' },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }

    return exercise;
  }

  /**
   * Find exercise by name or aliases (for matching exerciseName in workout blocks)
   */
  async findByExerciseName(exerciseName: string) {
    // Try exact name match first
    let exercise = await this.prisma.exercise.findFirst({
      where: {
        name: {
          equals: exerciseName,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        instructions: true,
        weightRanges: true,
        durationRanges: true,
        intensityLevels: true,
        repRanges: true,
        tempoOptions: true,
        equipmentVariations: true,
        movementVariations: true,
      },
    });

    // If not found, try aliases
    if (!exercise) {
      exercise = await this.prisma.exercise.findFirst({
        where: {
          aliases: {
            has: exerciseName,
          },
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          instructions: true,
          weightRanges: true,
          durationRanges: true,
          intensityLevels: true,
          repRanges: true,
          tempoOptions: true,
          equipmentVariations: true,
          movementVariations: true,
        },
      });
    }

    // Try partial match (e.g., "Slam Ball" matches "Slam Ball Overhead")
    if (!exercise) {
      const normalizedName = exerciseName.toLowerCase().trim();
      const allExercises = await this.prisma.exercise.findMany({
        select: {
          id: true,
          name: true,
          imageUrl: true,
          instructions: true,
          weightRanges: true,
          durationRanges: true,
          intensityLevels: true,
          repRanges: true,
          tempoOptions: true,
          equipmentVariations: true,
          movementVariations: true,
          aliases: true,
        },
      });

      exercise = allExercises.find(
        (ex) =>
          ex.name.toLowerCase().includes(normalizedName) ||
          normalizedName.includes(ex.name.toLowerCase()) ||
          ex.aliases.some((alias) =>
            alias.toLowerCase().includes(normalizedName) ||
            normalizedName.includes(alias.toLowerCase())
          )
      );
    }

    return exercise || null;
  }

  async create(createExerciseDto: CreateExerciseDto) {
    const { tiers, ...exerciseData } = createExerciseDto;

    // Use AI to analyze exercise and capture all variations/nuances
    const exerciseVariations = await this.analyzeExerciseVariations(createExerciseDto);
    
    // Generate brutalist style image for the exercise
    const imageUrl = await this.generateExerciseImage(createExerciseDto);

    // Extract instructions from variations if provided
    const { instructions, ...variationsWithoutInstructions } = exerciseVariations;

    return this.prisma.exercise.create({
      data: {
        ...exerciseData,
        instructions: instructions || exerciseData.instructions || null,
        ...variationsWithoutInstructions,
        imageUrl,
        imageGeneratedAt: imageUrl ? new Date() : null,
        tiers: tiers
          ? {
              create: tiers.map((tier) => ({
                tier: tier.tier,
                description: tier.description,
                typicalReps: tier.typicalReps,
              })),
            }
          : undefined,
      },
      include: {
        tiers: {
          orderBy: { tier: 'asc' },
        },
      },
    });
  }

  /**
   * Use AI to analyze exercise and capture all variations, weight ranges, intensity levels, etc.
   * Also generates short instructions on how to perform the exercise.
   */
  private async analyzeExerciseVariations(exercise: CreateExerciseDto): Promise<{
    weightRanges?: any;
    durationRanges?: any;
    intensityLevels?: any;
    repRanges?: any;
    tempoOptions?: any;
    equipmentVariations?: any;
    movementVariations?: any;
    variations?: any;
    instructions?: string;
  }> {
    if (!this.openai) {
      console.warn('OpenAI not configured, skipping exercise variation analysis');
      return {};
    }

    try {
      const prompt = `Analyze this exercise and provide comprehensive variations and parameters in JSON format:

Exercise: ${exercise.name}
Category: ${exercise.category}
Movement Pattern: ${exercise.movementPattern}
Equipment: ${exercise.equipment.join(', ')}
Primary Muscles: ${exercise.primaryMuscles.join(', ')}
Typical Use: ${exercise.typicalUse.join(', ')}

Provide a detailed JSON response with:
1. instructions: A short, clear 2-3 sentence instruction on how to perform this exercise correctly. Focus on key form cues, breathing, and movement pattern. Keep it concise and actionable.
2. weightRanges: Object with silver, gold, black tiers showing weight ranges (e.g., {"silver": "12-16kg", "gold": "20-24kg", "black": "28-32kg"}) - only if exercise uses weights
3. durationRanges: Object with silver, gold, black tiers for time-based exercises (e.g., {"silver": "30-45s", "gold": "45-60s", "black": "60-90s"}) - only if exercise is time-based
4. intensityLevels: Object with silver, gold, black tiers describing intensity (e.g., {"silver": "Low-Moderate", "gold": "Moderate-High", "black": "High-Max"})
5. repRanges: Object with silver, gold, black tiers showing rep ranges (e.g., {"silver": "8-12", "gold": "12-15", "black": "15-20"})
6. tempoOptions: Array of tempo variations (e.g., ["2020", "2220", "2s pause", "3s eccentric"])
7. equipmentVariations: Array of equipment alternatives (e.g., ["Dumbbells", "Kettlebells", "Barbell", "Bodyweight"])
8. movementVariations: Array of movement variations (e.g., ["Standard", "Pause", "Tempo", "Explosive", "Single-Arm", "Alternating"])

Return ONLY valid JSON, no markdown formatting. If a field doesn't apply (e.g., weightRanges for bodyweight exercises), set it to null.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert exercise science coach. Analyze exercises and provide detailed variations and parameters in JSON format only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        instructions: analysis.instructions || null,
        weightRanges: analysis.weightRanges || null,
        durationRanges: analysis.durationRanges || null,
        intensityLevels: analysis.intensityLevels || null,
        repRanges: analysis.repRanges || null,
        tempoOptions: analysis.tempoOptions || null,
        equipmentVariations: analysis.equipmentVariations || null,
        movementVariations: analysis.movementVariations || null,
        variations: analysis.variations || null,
      };
    } catch (error) {
      console.error('Failed to analyze exercise variations:', error);
      return {};
    }
  }

  /**
   * Generate a brutalist style image of the exercise using DALL-E
   * Creates transparent background image with single color showing 2-3 movement phases
   */
  private async generateExerciseImage(exercise: CreateExerciseDto): Promise<string | null> {
    if (!this.openai) {
      console.warn('OpenAI not configured, skipping image generation');
      return null;
    }

    try {
      // Generate two versions: one for dark mode (volt green) and one for light mode (blue)
      // We'll generate with white background and use CSS filters to change color based on theme
      const prompt = `Create a minimalist line art illustration showing 2-3 key phases of the movement "${exercise.name}". 

CRITICAL REQUIREMENTS:
- Show 2-3 sequential movement phases side by side or overlapping to show the exercise progression
- Use ONLY a single color: bright lime green (#ccff00) for the entire illustration
- Transparent or white background (preferably transparent, but white is acceptable)
- Minimalist line art style: clean, simple lines, no shading or gradients
- Brutalist aesthetic: bold, geometric, structural
- Technical drawing style: precise, architectural
- Show the key body positions and movement flow clearly
- Each phase should be clearly distinguishable (e.g., start position, mid-movement, end position)
- Focus on form and body position, not details
- NØDE brand aesthetic: raw, powerful, uncompromising

Equipment: ${exercise.equipment.join(', ')}
Movement Pattern: ${exercise.movementPattern}
Category: ${exercise.category}

The image should be suitable for use in a fitness app interface. Use a single bright lime green color (#ccff00) for all lines and shapes. Background should be transparent or pure white.`;

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      });

      const imageUrl = response.data[0]?.url;
      
      if (imageUrl) {
        console.log(`✅ Generated image for exercise: ${exercise.name}`);
        // Note: In production, you'd want to download and store this image on your own CDN/storage
        // For now, we'll store the DALL-E URL directly
        // The frontend will use CSS filters to change color based on theme
        return imageUrl;
      }

      return null;
    } catch (error) {
      console.error('Failed to generate exercise image:', error);
      return null;
    }
  }

  async update(id: string, updateExerciseDto: UpdateExerciseDto) {
    const { tiers, ...exerciseData } = updateExerciseDto;

    // Check if exercise exists
    await this.findOne(id);

    // If tiers are provided, replace them
    if (tiers !== undefined) {
      // Delete existing tiers
      await this.prisma.exerciseTier.deleteMany({
        where: { exerciseId: id },
      });

      // Create new tiers
      if (tiers.length > 0) {
        await this.prisma.exerciseTier.createMany({
          data: tiers.map((tier) => ({
            exerciseId: id,
            tier: tier.tier,
            description: tier.description,
            typicalReps: tier.typicalReps,
          })),
        });
      }
    }

    return this.prisma.exercise.update({
      where: { id },
      data: exerciseData,
      include: {
        tiers: {
          orderBy: { tier: 'asc' },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.exercise.delete({
      where: { id },
    });
  }
}
