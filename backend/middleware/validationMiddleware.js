import validator from "validator";

export const validateUrl = (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    if (typeof url !== "string") {
      return res.status(400).json({
        success: false,
        message: "URL must be a string",
      });
    }

    if (
      !validator.isURL(url, {
        protocols: ["http", "https"],
        require_protocol: true,
      })
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid URL with http:// or https://",
      });
    }

    // Check URL length
    if (url.length > 2048) {
      return res.status(400).json({
        success: false,
        message: "URL is too long (maximum 2048 characters)",
      });
    }

    next();
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({
      success: false,
      message: "Validation error",
    });
  }
};
