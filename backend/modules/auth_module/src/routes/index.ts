// V1 Routes (current implementation)
import authRoutesV1 from "./v1/authRoutes";
import userRoutesV1 from "./v1/userRoutes";
import mfaRoutesV1 from "./v1/mfaRoutes";
import performanceRoutesV1 from "./v1/performanceRoutes";
import sseRoutesV1 from "./v1/sseRoutes";

// Export versioned routes
export { 
  authRoutesV1, 
  userRoutesV1, 
  mfaRoutesV1, 
  performanceRoutesV1,
  sseRoutesV1
};
