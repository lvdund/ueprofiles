package middleware

import (
	"backend-webUE/services"

	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func AuthMiddleware(userService *services.UserService, jwtSecret string) gin.HandlerFunc {
	fmt.Println("JWT Secret in AuthMiddleware:", jwtSecret)
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Bearer token malformed"})
			return
		}
		fmt.Println("Token String in AuthMiddleware:", tokenString)

		//Parse the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the algorithm
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrInvalidKeyType
			}
			return []byte(jwtSecret), nil
		})
		if err != nil || !token.Valid {
			fmt.Println("Error parsing token:", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// Check if token is blacklisted
		isBlacklisted, err := userService.IsTokenBlacklisted(c.Request.Context(), tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}
		if isBlacklisted {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token has been revoked"})
			return
		}

		// Set the user in context
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			username, ok := claims["username"].(string)
			if !ok {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
				return
			}
			// Retrieve the user from the database to get the UserID
			user, err := userService.GetUserByUsername(c.Request.Context(), username)
			if err != nil || user == nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
				return
			}
			c.Set("userID", user.ID)
			c.Set("username", username)
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

	}
}
