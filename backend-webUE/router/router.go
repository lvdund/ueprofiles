package router

import (
	"backend-webUE/api"
	"backend-webUE/config"
	"backend-webUE/middleware"
	"backend-webUE/services"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(ueProfileAPI *api.UeProfileAPI, userAPI *api.UserAPI, userService *services.UserService, serverConfig config.ServerConfig, jwtSecret string) *gin.Engine {

	// Initialize router
	router := gin.Default()

	// CORS configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	//Public routes
	userAPI.RegisterRoutes(router)

	//Protected routes
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware(userService, jwtSecret))

	ueProfileAPI.RegisterRoutes(protected)

	return router
}
