import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

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

  async create(createExerciseDto: CreateExerciseDto) {
    const { tiers, ...exerciseData } = createExerciseDto;

    return this.prisma.exercise.create({
      data: {
        ...exerciseData,
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
