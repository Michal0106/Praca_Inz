export const getUserId = (req) => {
  if (req.user && req.user.userId) {
    return req.user.userId;
  }

  if (req.user && req.user.id) {
    return req.user.id;
  }

  if (req.session && req.session.userId) {
    return req.session.userId;
  }

  return null;
};

export const getStravaToken = async (req) => {
  if (req.session && req.session.accessToken) {
    return req.session.accessToken;
  }

  const userId = getUserId(req);
  if (userId) {
    const { default: prisma } = await import("../config/database.js");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stravaAccessToken: true,
        stravaTokenExpiresAt: true,
        stravaRefreshToken: true,
      },
    });

    if (user && user.stravaAccessToken) {
      return user.stravaAccessToken;
    }
  }

  return null;
};

export default { getUserId, getStravaToken };
