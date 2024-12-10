package config

import (
	"os"
	"strconv"
)

type MongoConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Database string
}

type ServerConfig struct {
	Port int
}

type AppConfig struct {
	JWTSecret string
}

// Load the config from env variables/default values
func LoadConfig() (MongoConfig, ServerConfig, AppConfig) {
	var mongoConfig MongoConfig
	var serverConfig ServerConfig
	var appConfig AppConfig

	//MongoDB Configuration
	mongoConfig.Host = getEnv("MONGO_HOST", "localhost")
	mongoConfig.Port = getEnvAsInt("MONGO_PORT", 27017)
	mongoConfig.User = getEnv("MONGO_USER", "user")
	mongoConfig.Password = getEnv("MONGO_PASSWORD", "password")
	mongoConfig.Database = getEnv("MONGO_DATABASE", "webue_db")

	//Server Configuration
	serverConfig.Port = getEnvAsInt("SERVER_PORT", 8080)

	//App Configuration
	appConfig.JWTSecret = getEnv("JWT_SECRET", "your-default-jwt-secret")
	return mongoConfig, serverConfig, appConfig
}

func getEnv(key string, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
