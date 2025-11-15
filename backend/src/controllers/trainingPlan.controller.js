import prisma from '../config/database.js';

export const getRecommendedPlan = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const userStats = await prisma.userStats.findUnique({
      where: { userId }
    });
    
    if (!userStats || userStats.totalActivities === 0) {
      return res.status(404).json({ 
        error: 'Insufficient data',
        message: 'Please sync your activities first to get a personalized recommendation'
      });
    }
    
    const recentActivities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      take: 30
    });
    
    const avgWeeklyHours = (userStats.totalDuration / 3600) / 
      (Math.ceil((Date.now() - new Date(recentActivities[recentActivities.length - 1]?.startDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 7)));
    
    const activitiesPerWeek = recentActivities.length / 
      Math.max(1, Math.ceil((Date.now() - new Date(recentActivities[recentActivities.length - 1]?.startDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 7)));
    
    const avgDistance = userStats.totalDistance / userStats.totalActivities;
    
    let level = 'BEGINNER';
    if (avgWeeklyHours > 8 && activitiesPerWeek > 5) {
      level = 'ELITE';
    } else if (avgWeeklyHours > 5 && activitiesPerWeek > 4) {
      level = 'ADVANCED';
    } else if (avgWeeklyHours > 3 && activitiesPerWeek > 2) {
      level = 'INTERMEDIATE';
    }
    
    const highIntensityCount = await prisma.activity.count({
      where: {
        userId,
        averageHeartRate: { gte: 150 }
      }
    });
    
    let focusType = 'ENDURANCE';
    if (highIntensityCount / userStats.totalActivities > 0.4) {
      focusType = 'SPEED';
    } else if (avgDistance > 15000) {
      focusType = 'ENDURANCE';
    } else {
      focusType = 'MIXED';
    }
    
    const recommendedPlans = await prisma.$queryRaw`
      SELECT 
        t.*,
        (
          CASE 
            WHEN t.level = ${level}::text::"Level" THEN 100
            WHEN t.level = 'INTERMEDIATE' AND ${level} = 'ADVANCED' THEN 80
            WHEN t.level = 'BEGINNER' AND ${level} = 'INTERMEDIATE' THEN 80
            WHEN t.level = 'ADVANCED' AND ${level} = 'ELITE' THEN 80
            ELSE 50
          END +
          CASE 
            WHEN t."focusType" = ${focusType}::text::"FocusType" THEN 100
            WHEN t."focusType" = 'MIXED' THEN 70
            ELSE 30
          END +
          CASE 
            WHEN ABS(t."weeklyHours" - ${Math.round(avgWeeklyHours)}) <= 1 THEN 100
            WHEN ABS(t."weeklyHours" - ${Math.round(avgWeeklyHours)}) <= 2 THEN 70
            ELSE 40
          END
        ) as match_score
      FROM "TrainingPlanTemplate" t
      ORDER BY match_score DESC
      LIMIT 3
    `;
    
    const topPlan = recommendedPlans[0];
    
    if (topPlan) {
      const fullPlan = await prisma.trainingPlanTemplate.findUnique({
        where: { id: topPlan.id },
        include: {
          weeks: {
            include: {
              sessions: true
            },
            orderBy: { weekNumber: 'asc' }
          }
        }
      });
      
      res.json({
        recommendedPlan: fullPlan,
        userProfile: {
          level,
          focusType,
          avgWeeklyHours: avgWeeklyHours.toFixed(1),
          activitiesPerWeek: activitiesPerWeek.toFixed(1)
        },
        alternativePlans: recommendedPlans.slice(1)
      });
    } else {
      res.status(404).json({ error: 'No suitable plan found' });
    }
  } catch (error) {
    console.error('Get recommended plan error:', error);
    res.status(500).json({ error: 'Failed to fetch recommended plan' });
  }
};

export const getPlanTemplates = async (req, res) => {
  try {
    const { level, focusType } = req.query;
    
    const where = {
      ...(level && { level }),
      ...(focusType && { focusType })
    };
    
    const templates = await prisma.trainingPlanTemplate.findMany({
      where,
      include: {
        weeks: {
          include: {
            sessions: true
          },
          orderBy: { weekNumber: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch plan templates' });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plan = await prisma.trainingPlanTemplate.findUnique({
      where: { id },
      include: {
        weeks: {
          include: {
            sessions: {
              orderBy: { dayOfWeek: 'asc' }
            }
          },
          orderBy: { weekNumber: 'asc' }
        }
      }
    });
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    res.json({ plan });
  } catch (error) {
    console.error('Get plan by id error:', error);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await prisma.trainingSession.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Parse intervals if they exist in description
    let intervals = null;
    if (session.type === 'INTERVAL' && session.description) {
      // Try to extract interval information from description
      const intervalMatch = session.description.match(/(\d+)x(\d+)/i);
      if (intervalMatch) {
        intervals = {
          sets: parseInt(intervalMatch[1]),
          duration: parseInt(intervalMatch[2])
        };
      }
    }
    
    res.json({ 
      session,
      intervals
    });
  } catch (error) {
    console.error('Get session by id error:', error);
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
};
