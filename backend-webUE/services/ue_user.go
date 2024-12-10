package services

import (
	"backend-webUE/models"
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	db *mongo.Database
}

func NewUserService(db *mongo.Database) *UserService {
	return &UserService{db: db}
}

// Create a new user with a hashed password
func (s *UserService) CreateUser(ctx context.Context, username, password string) error {
	collection := s.db.Collection("users")

	//Check if user already exists
	count, err := collection.CountDocuments(ctx, bson.M{"username": username})
	if err != nil {
		return fmt.Errorf("failed to check existing users: %v", err)
	}
	if count > 0 {
		return fmt.Errorf("username already exists")
	}

	//Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %v", err)
	}

	user := models.User{
		Username: username,
		Password: string(hashedPassword),
	}

	_, err = collection.InsertOne(ctx, user)
	if err != nil {
		return fmt.Errorf("failed to create user: %v", err)
	}
	return nil
}

// authenticate a user and returns the user object if successful
func (s *UserService) AuthenticateUser(ctx context.Context, username, password string) (*models.User, error) {
	collection := s.db.Collection("users")

	var user models.User
	err := collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find user: %v", err)
	}

	// Compare the plain-text password with the hashed password from the database
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, nil // Invalid password
	}

	return &user, nil
}

// BlacklistToken adds a token to the blacklist
func (s *UserService) BlacklistToken(ctx context.Context, tokenString string, expiresAt time.Time) error {
	collection := s.db.Collection("blacklisted_tokens")

	blacklistedToken := models.BlacklistedToken{
		Token:     tokenString,
		ExpiresAt: expiresAt,
	}

	_, err := collection.InsertOne(ctx, blacklistedToken)
	if err != nil {
		return err
	}
	return nil
}

// IsTokenBlacklisted checks if a token is in the blacklist
func (s *UserService) IsTokenBlacklisted(ctx context.Context, tokenString string) (bool, error) {
	collection := s.db.Collection("blacklisted_tokens")

	// Remove expired tokens to keep the collection clean
	_, _ = collection.DeleteMany(ctx, bson.M{
		"expiresAt": bson.M{"$lte": time.Now()},
	})

	count, err := collection.CountDocuments(ctx, bson.M{"token": tokenString})
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (s *UserService) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	collection := s.db.Collection("users")

	var user models.User
	err := collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // User not found
		}
		return nil, fmt.Errorf("failed to find user: %v", err)
	}

	return &user, nil
}
