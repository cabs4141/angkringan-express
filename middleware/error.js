export const errorHandler = (err, req, res, next) => {
  try {
    if (err.name === "UnauthorizedError") {
      return res.status(401).json({ message: "unauthorized user" });
    }
    if (err.name === "ValidationError") {
      return res.status(401).json({ message: err.message });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
