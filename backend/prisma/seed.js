import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const trainingTemplates = [
  {
    name: "Beginner Running Base",
    description: "4-week base building plan for beginners",
    level: "BEGINNER",
    weeklyHours: 3,
    daysPerWeek: 3,
    focusType: "ENDURANCE",
    duration: 4,
    weeks: [
      {
        weekNumber: 1,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 30, intensity: "LOW", description: "Easy pace, focus on form" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 25, intensity: "LOW", description: "Comfortable pace" },
          { dayOfWeek: 5, sessionType: "Easy Run", duration: 35, intensity: "LOW", description: "Long easy run" }
        ]
      },
      {
        weekNumber: 2,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 35, intensity: "LOW", description: "Easy pace, focus on form" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 30, intensity: "LOW", description: "Comfortable pace" },
          { dayOfWeek: 5, sessionType: "Easy Run", duration: 40, intensity: "LOW", description: "Long easy run" }
        ]
      },
      {
        weekNumber: 3,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 40, intensity: "LOW", description: "Easy pace, focus on form" },
          { dayOfWeek: 3, sessionType: "Tempo Run", duration: 30, intensity: "MEDIUM", description: "10 min easy, 15 min tempo, 5 min cool down" },
          { dayOfWeek: 5, sessionType: "Easy Run", duration: 45, intensity: "LOW", description: "Long easy run" }
        ]
      },
      {
        weekNumber: 4,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 30, intensity: "LOW", description: "Recovery week - easy pace" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 25, intensity: "LOW", description: "Comfortable pace" },
          { dayOfWeek: 5, sessionType: "Easy Run", duration: 35, intensity: "LOW", description: "Easy long run" }
        ]
      }
    ]
  },
  {
    name: "Intermediate Endurance Builder",
    description: "6-week endurance focused plan for intermediate athletes",
    level: "INTERMEDIATE",
    weeklyHours: 6,
    daysPerWeek: 4,
    focusType: "ENDURANCE",
    duration: 6,
    weeks: [
      {
        weekNumber: 1,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 45, intensity: "LOW", description: "Easy aerobic pace" },
          { dayOfWeek: 3, sessionType: "Tempo Run", duration: 50, intensity: "MEDIUM", description: "10 min warmup, 30 min tempo, 10 min cooldown" },
          { dayOfWeek: 5, sessionType: "Intervals", duration: 60, intensity: "HIGH", description: "5x5min at threshold with 2min recovery" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 90, intensity: "LOW", description: "Long steady run" }
        ]
      },
      {
        weekNumber: 2,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 50, intensity: "LOW", description: "Easy aerobic pace" },
          { dayOfWeek: 3, sessionType: "Tempo Run", duration: 55, intensity: "MEDIUM", description: "10 min warmup, 35 min tempo, 10 min cooldown" },
          { dayOfWeek: 5, sessionType: "Intervals", duration: 60, intensity: "HIGH", description: "6x5min at threshold with 2min recovery" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 100, intensity: "LOW", description: "Long steady run" }
        ]
      },
      {
        weekNumber: 3,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 55, intensity: "LOW", description: "Easy aerobic pace" },
          { dayOfWeek: 3, sessionType: "Tempo Run", duration: 60, intensity: "MEDIUM", description: "10 min warmup, 40 min tempo, 10 min cooldown" },
          { dayOfWeek: 5, sessionType: "Intervals", duration: 65, intensity: "HIGH", description: "7x5min at threshold with 2min recovery" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 110, intensity: "LOW", description: "Long steady run" }
        ]
      },
      {
        weekNumber: 4,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 40, intensity: "LOW", description: "Recovery week - easy pace" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 45, intensity: "LOW", description: "Comfortable pace" },
          { dayOfWeek: 5, sessionType: "Tempo Run", duration: 45, intensity: "MEDIUM", description: "Easy tempo session" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 75, intensity: "LOW", description: "Easier long run" }
        ]
      },
      {
        weekNumber: 5,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 60, intensity: "LOW", description: "Easy aerobic pace" },
          { dayOfWeek: 3, sessionType: "Tempo Run", duration: 65, intensity: "MEDIUM", description: "10 min warmup, 45 min tempo, 10 min cooldown" },
          { dayOfWeek: 5, sessionType: "Intervals", duration: 70, intensity: "HIGH", description: "8x5min at threshold with 2min recovery" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 120, intensity: "LOW", description: "Long steady run" }
        ]
      },
      {
        weekNumber: 6,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 45, intensity: "LOW", description: "Recovery week - easy pace" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 40, intensity: "LOW", description: "Comfortable pace" },
          { dayOfWeek: 5, sessionType: "Tempo Run", duration: 50, intensity: "MEDIUM", description: "Light tempo session" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 80, intensity: "LOW", description: "Easier long run" }
        ]
      }
    ]
  },
  {
    name: "Advanced Speed Development",
    description: "8-week speed and power development plan",
    level: "ADVANCED",
    weeklyHours: 8,
    daysPerWeek: 5,
    focusType: "SPEED",
    duration: 8,
    weeks: [
      {
        weekNumber: 1,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 50, intensity: "LOW", description: "Recovery run" },
          { dayOfWeek: 2, sessionType: "Intervals", duration: 70, intensity: "HIGH", description: "12x400m at 5K pace with 90sec recovery" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 60, intensity: "MEDIUM", description: "Sustained tempo effort" },
          { dayOfWeek: 6, sessionType: "Hill Repeats", duration: 60, intensity: "HIGH", description: "10x90sec hill repeats" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 90, intensity: "LOW", description: "Aerobic long run" }
        ]
      },
      {
        weekNumber: 2,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 55, intensity: "LOW", description: "Recovery run" },
          { dayOfWeek: 2, sessionType: "Intervals", duration: 75, intensity: "HIGH", description: "10x600m at 5K pace with 2min recovery" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 65, intensity: "MEDIUM", description: "Sustained tempo effort" },
          { dayOfWeek: 6, sessionType: "Hill Repeats", duration: 65, intensity: "HIGH", description: "12x90sec hill repeats" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 100, intensity: "LOW", description: "Aerobic long run" }
        ]
      },
      {
        weekNumber: 3,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 60, intensity: "LOW", description: "Recovery run" },
          { dayOfWeek: 2, sessionType: "Intervals", duration: 80, intensity: "HIGH", description: "8x800m at 5K pace with 2min recovery" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 70, intensity: "MEDIUM", description: "Sustained tempo effort" },
          { dayOfWeek: 6, sessionType: "Fartlek", duration: 70, intensity: "HIGH", description: "60min fartlek with varied efforts" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 110, intensity: "LOW", description: "Aerobic long run" }
        ]
      },
      {
        weekNumber: 4,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 45, intensity: "LOW", description: "Recovery week - easy run" },
          { dayOfWeek: 2, sessionType: "Easy Run", duration: 50, intensity: "LOW", description: "Easy pace" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 50, intensity: "MEDIUM", description: "Light tempo" },
          { dayOfWeek: 6, sessionType: "Strides", duration: 45, intensity: "MEDIUM", description: "Easy run with strides" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 80, intensity: "LOW", description: "Easy long run" }
        ]
      },
      {
        weekNumber: 5,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 60, intensity: "LOW", description: "Recovery run" },
          { dayOfWeek: 2, sessionType: "Intervals", duration: 85, intensity: "HIGH", description: "6x1000m at 5K pace with 2.5min recovery" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 75, intensity: "MEDIUM", description: "Sustained tempo effort" },
          { dayOfWeek: 6, sessionType: "Track Intervals", duration: 75, intensity: "HIGH", description: "Mix of 200m, 400m, 800m repeats" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 115, intensity: "LOW", description: "Aerobic long run" }
        ]
      },
      {
        weekNumber: 6,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 65, intensity: "LOW", description: "Recovery run" },
          { dayOfWeek: 2, sessionType: "Intervals", duration: 85, intensity: "HIGH", description: "5x1200m at threshold with 3min recovery" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 80, intensity: "MEDIUM", description: "Progressive tempo run" },
          { dayOfWeek: 6, sessionType: "Hill Repeats", duration: 75, intensity: "HIGH", description: "15x90sec hill repeats" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 120, intensity: "LOW", description: "Aerobic long run" }
        ]
      },
      {
        weekNumber: 7,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 50, intensity: "LOW", description: "Recovery week - easy run" },
          { dayOfWeek: 2, sessionType: "Intervals", duration: 60, intensity: "HIGH", description: "Light interval session" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 55, intensity: "MEDIUM", description: "Moderate tempo" },
          { dayOfWeek: 6, sessionType: "Easy Run", duration: 50, intensity: "LOW", description: "Easy pace with strides" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 85, intensity: "LOW", description: "Easy long run" }
        ]
      },
      {
        weekNumber: 8,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 45, intensity: "LOW", description: "Taper - easy run" },
          { dayOfWeek: 2, sessionType: "Strides", duration: 40, intensity: "MEDIUM", description: "Easy run with fast strides" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 45, intensity: "MEDIUM", description: "Short tempo effort" },
          { dayOfWeek: 6, sessionType: "Easy Run", duration: 30, intensity: "LOW", description: "Very easy shakeout" },
          { dayOfWeek: 7, sessionType: "Race Day", duration: 60, intensity: "HIGH", description: "Race or time trial" }
        ]
      }
    ]
  },
  {
    name: "Mixed Training - Intermediate",
    description: "Balanced plan combining endurance, strength, and speed",
    level: "INTERMEDIATE",
    weeklyHours: 7,
    daysPerWeek: 5,
    focusType: "MIXED",
    duration: 6,
    weeks: [
      {
        weekNumber: 1,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 45, intensity: "LOW", description: "Easy aerobic run" },
          { dayOfWeek: 2, sessionType: "Strength Training", duration: 60, intensity: "MEDIUM", description: "Full body strength workout" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 55, intensity: "MEDIUM", description: "Tempo run with warmup/cooldown" },
          { dayOfWeek: 5, sessionType: "Intervals", duration: 60, intensity: "HIGH", description: "Speed intervals" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 90, intensity: "LOW", description: "Long endurance run" }
        ]
      },
      {
        weekNumber: 2,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 50, intensity: "LOW", description: "Easy aerobic run" },
          { dayOfWeek: 2, sessionType: "Strength Training", duration: 65, intensity: "MEDIUM", description: "Full body strength workout" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 60, intensity: "MEDIUM", description: "Tempo run with warmup/cooldown" },
          { dayOfWeek: 5, sessionType: "Hill Repeats", duration: 60, intensity: "HIGH", description: "Hill strength work" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 100, intensity: "LOW", description: "Long endurance run" }
        ]
      },
      {
        weekNumber: 3,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 55, intensity: "LOW", description: "Easy aerobic run" },
          { dayOfWeek: 2, sessionType: "Strength Training", duration: 70, intensity: "MEDIUM", description: "Full body strength workout" },
          { dayOfWeek: 4, sessionType: "Fartlek", duration: 65, intensity: "MEDIUM", description: "Fartlek training session" },
          { dayOfWeek: 5, sessionType: "Intervals", duration: 65, intensity: "HIGH", description: "Speed intervals" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 110, intensity: "LOW", description: "Long endurance run" }
        ]
      },
      {
        weekNumber: 4,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 40, intensity: "LOW", description: "Recovery week - easy run" },
          { dayOfWeek: 2, sessionType: "Strength Training", duration: 50, intensity: "LOW", description: "Light strength maintenance" },
          { dayOfWeek: 4, sessionType: "Easy Run", duration: 45, intensity: "LOW", description: "Easy pace" },
          { dayOfWeek: 5, sessionType: "Tempo Run", duration: 45, intensity: "MEDIUM", description: "Light tempo" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 75, intensity: "LOW", description: "Easy long run" }
        ]
      },
      {
        weekNumber: 5,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 60, intensity: "LOW", description: "Easy aerobic run" },
          { dayOfWeek: 2, sessionType: "Strength Training", duration: 75, intensity: "MEDIUM", description: "Full body strength workout" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 70, intensity: "MEDIUM", description: "Extended tempo effort" },
          { dayOfWeek: 5, sessionType: "Intervals", duration: 70, intensity: "HIGH", description: "Speed intervals" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 115, intensity: "LOW", description: "Long endurance run" }
        ]
      },
      {
        weekNumber: 6,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 45, intensity: "LOW", description: "Recovery week - easy run" },
          { dayOfWeek: 2, sessionType: "Strength Training", duration: 55, intensity: "LOW", description: "Light strength maintenance" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 50, intensity: "MEDIUM", description: "Moderate tempo" },
          { dayOfWeek: 5, sessionType: "Easy Run", duration: 45, intensity: "LOW", description: "Easy with strides" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 80, intensity: "LOW", description: "Easy long run" }
        ]
      }
    ]
  },
  {
    name: "Elite Performance Plan",
    description: "High-volume elite training program",
    level: "ELITE",
    weeklyHours: 12,
    daysPerWeek: 6,
    focusType: "MIXED",
    duration: 8,
    weeks: [
      {
        weekNumber: 1,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 75, intensity: "LOW", description: "Easy morning run" },
          { dayOfWeek: 2, sessionType: "Intervals", duration: 90, intensity: "HIGH", description: "VO2max intervals" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 60, intensity: "LOW", description: "Recovery run" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 85, intensity: "MEDIUM", description: "Lactate threshold run" },
          { dayOfWeek: 5, sessionType: "Easy Run", duration: 70, intensity: "LOW", description: "Easy aerobic run" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 150, intensity: "LOW", description: "Long endurance run" }
        ]
      },
      {
        weekNumber: 2,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 80, intensity: "LOW", description: "Easy morning run" },
          { dayOfWeek: 2, sessionType: "Track Intervals", duration: 95, intensity: "HIGH", description: "Mixed distance intervals" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 65, intensity: "LOW", description: "Recovery run" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 90, intensity: "MEDIUM", description: "Progressive tempo run" },
          { dayOfWeek: 5, sessionType: "Hill Repeats", duration: 75, intensity: "HIGH", description: "Strength hills" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 165, intensity: "LOW", description: "Long endurance run with tempo finish" }
        ]
      },
      {
        weekNumber: 3,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 85, intensity: "LOW", description: "Easy morning run" },
          { dayOfWeek: 2, sessionType: "Intervals", duration: 100, intensity: "HIGH", description: "VO2max intervals" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 70, intensity: "LOW", description: "Recovery run" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 95, intensity: "MEDIUM", description: "Extended threshold run" },
          { dayOfWeek: 5, sessionType: "Fartlek", duration: 80, intensity: "MEDIUM", description: "Long fartlek session" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 180, intensity: "LOW", description: "Long endurance run" }
        ]
      },
      {
        weekNumber: 4,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 60, intensity: "LOW", description: "Recovery week - easy run" },
          { dayOfWeek: 2, sessionType: "Strides", duration: 65, intensity: "MEDIUM", description: "Easy run with strides" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 55, intensity: "LOW", description: "Easy recovery" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 70, intensity: "MEDIUM", description: "Moderate tempo" },
          { dayOfWeek: 5, sessionType: "Easy Run", duration: 60, intensity: "LOW", description: "Easy aerobic" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 120, intensity: "LOW", description: "Reduced long run" }
        ]
      },
      {
        weekNumber: 5,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 90, intensity: "LOW", description: "Easy morning run" },
          { dayOfWeek: 2, sessionType: "Intervals", duration: 105, intensity: "HIGH", description: "Long intervals at threshold" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 75, intensity: "LOW", description: "Recovery run" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 100, intensity: "MEDIUM", description: "Double threshold session" },
          { dayOfWeek: 5, sessionType: "Hill Repeats", duration: 85, intensity: "HIGH", description: "Power hills" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 195, intensity: "LOW", description: "Peak long run" }
        ]
      },
      {
        weekNumber: 6,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 85, intensity: "LOW", description: "Easy morning run" },
          { dayOfWeek: 2, sessionType: "Track Intervals", duration: 100, intensity: "HIGH", description: "Speed endurance work" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 70, intensity: "LOW", description: "Recovery run" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 95, intensity: "MEDIUM", description: "Sustained tempo" },
          { dayOfWeek: 5, sessionType: "Fartlek", duration: 85, intensity: "MEDIUM", description: "Varied pace fartlek" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 180, intensity: "LOW", description: "Long run with surges" }
        ]
      },
      {
        weekNumber: 7,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 70, intensity: "LOW", description: "Recovery week - easy run" },
          { dayOfWeek: 2, sessionType: "Intervals", duration: 75, intensity: "HIGH", description: "Short sharp intervals" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 60, intensity: "LOW", description: "Easy recovery" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 75, intensity: "MEDIUM", description: "Moderate tempo" },
          { dayOfWeek: 5, sessionType: "Easy Run", duration: 65, intensity: "LOW", description: "Easy with strides" },
          { dayOfWeek: 7, sessionType: "Long Run", duration: 135, intensity: "LOW", description: "Moderate long run" }
        ]
      },
      {
        weekNumber: 8,
        sessions: [
          { dayOfWeek: 1, sessionType: "Easy Run", duration: 60, intensity: "LOW", description: "Taper - easy run" },
          { dayOfWeek: 2, sessionType: "Strides", duration: 50, intensity: "MEDIUM", description: "Easy run with fast strides" },
          { dayOfWeek: 3, sessionType: "Easy Run", duration: 40, intensity: "LOW", description: "Short easy run" },
          { dayOfWeek: 4, sessionType: "Tempo Run", duration: 55, intensity: "MEDIUM", description: "Short tempo sharpener" },
          { dayOfWeek: 5, sessionType: "Easy Run", duration: 35, intensity: "LOW", description: "Very easy shakeout" },
          { dayOfWeek: 7, sessionType: "Race Day", duration: 120, intensity: "HIGH", description: "Goal race or key workout" }
        ]
      }
    ]
  }
];

async function main() {
  console.log('Seeding database...');

  for (const template of trainingTemplates) {
    const { weeks, ...templateData } = template;
    
    await prisma.trainingPlanTemplate.create({
      data: {
        ...templateData,
        weeks: {
          create: weeks.map(week => ({
            weekNumber: week.weekNumber,
            sessions: {
              create: week.sessions
            }
          }))
        }
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
