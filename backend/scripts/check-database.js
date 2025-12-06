import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== SPRAWDZANIE BAZY DANYCH ===\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        stravaId: true,
        _count: {
          select: {
            activities: true
          }
        }
      }
    });
    
    console.log(`📊 Liczba użytkowników: ${users.length}`);
    if (users.length > 0) {
      console.log('\nUżytkownicy:');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.firstName || 'Brak imienia'} ${user.lastName || ''})`);
        console.log(`    ID: ${user.id}`);
        console.log(`    Strava: ${user.stravaId ? 'Połączone' : 'Niepołączone'}`);
        console.log(`    Aktywności: ${user._count.activities}`);
        console.log(`    Utworzono: ${user.createdAt.toLocaleDateString('pl-PL')}`);
      });
    }

    const totalActivities = await prisma.activity.count();
    console.log(`\n🏃 Całkowita liczba aktywności: ${totalActivities}`);

    if (totalActivities > 0) {
      const activityTypes = await prisma.activity.groupBy({
        by: ['type'],
        _count: true
      });
      
      console.log('\nRozkład typów aktywności:');
      activityTypes.forEach(({ type, _count }) => {
        console.log(`  - ${type}: ${_count}`);
      });

      const activitySources = await prisma.activity.groupBy({
        by: ['source'],
        _count: true
      });
      
      console.log('\nŹródła danych:');
      activitySources.forEach(({ source, _count }) => {
        console.log(`  - ${source}: ${_count}`);
      });

      const recentActivities = await prisma.activity.findMany({
        take: 5,
        orderBy: { startDate: 'desc' },
        select: {
          name: true,
          type: true,
          startDate: true,
          distance: true,
          duration: true,
          source: true
        }
      });

      console.log('\nOstatnie 5 aktywności:');
      recentActivities.forEach(activity => {
        const distance = activity.distance ? `${(activity.distance / 1000).toFixed(2)} km` : 'brak';
        const duration = `${Math.floor(activity.duration / 60)} min`;
        console.log(`  - ${activity.name} (${activity.type})`);
        console.log(`    Data: ${activity.startDate.toLocaleDateString('pl-PL')}`);
        console.log(`    Dystans: ${distance}, Czas: ${duration}, Źródło: ${activity.source}`);
      });
    }

    const userStats = await prisma.userStats.findMany();
    console.log(`\n📈 Statystyki użytkowników: ${userStats.length}`);
    if (userStats.length > 0) {
      userStats.forEach(stats => {
        console.log(`  Użytkownik: ${stats.userId}`);
        console.log(`  - Aktywności: ${stats.totalActivities}`);
        console.log(`  - Dystans: ${(stats.totalDistance / 1000).toFixed(2)} km`);
        console.log(`  - Czas: ${Math.floor(stats.totalDuration / 3600)} godz`);
        console.log(`  - Ostatnia synchronizacja: ${stats.lastSyncDate ? stats.lastSyncDate.toLocaleDateString('pl-PL') : 'Brak'}`);
      });
    }

    const fitnessMetrics = await prisma.fitnessMetrics.count();
    console.log(`\n💪 Metryki fitness: ${fitnessMetrics}`);

    const achievements = await prisma.achievement.count();
    const earnedAchievements = await prisma.achievement.count({
      where: { earned: true }
    });
    console.log(`\n🏆 Osiągnięcia: ${earnedAchievements}/${achievements} zdobytych`);

    const gpsPoints = await prisma.gpsPoint.count();
    console.log(`\n📍 Punkty GPS: ${gpsPoints}`);

    const powerCurves = await prisma.powerCurve.count();
    console.log(`\n⚡ Power Curves: ${powerCurves}`);

    const clusters = await prisma.activityCluster.count();
    console.log(`\n🔍 Activity Clusters: ${clusters}`);

    console.log('\n=== KONIEC SPRAWDZANIA ===');

  } catch (error) {
    console.error('❌ Błąd podczas sprawdzania bazy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
