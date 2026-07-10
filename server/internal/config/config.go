package config

import "os"

type Config struct {
	ServerPort  string
	DatabaseURL string
	JWTSecret   string
	UploadDir   string
	CORSOrigins string
}

func Load() *Config {
	return &Config{
		ServerPort:  getEnv("SERVER_PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://researchhub:researchhub@localhost:5432/researchhub?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "researchhub-dev-secret-change-in-production"),
		UploadDir:   getEnv("UPLOAD_DIR", "./uploads"),
		CORSOrigins: getEnv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
