export const getUserIp = async (): Promise<string> => {
  try {
    // In a real app, you'd use a service like ipify to get the real IP
    // For this demo, we'll generate a random IP to simulate the concept
    const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    return ip;
  } catch (error) {
    console.error("Failed to get IP address:", error);
    return "0.0.0.0"; // Fallback
  }
};