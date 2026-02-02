package main

import (
	"log"
	"os"
	"time"

	"agri-api/config"
	"agri-api/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system env")
	}

	config.ConnectDB()

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"https://smart-agriwaste.vercel.app"
		},
		AllowMethods: []string{
			"GET", "POST", "PUT", "DELETE", "OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},
		ExposeHeaders: []string{
			"Content-Length",
		},
		AllowCredentials: true,
		MaxAge: 12 * time.Hour,
	}))

	routes.RegisterRoutes(router)

	// ✅ IMPORTANT FOR AZURE
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // local development
	}

	router.Run(":" + port)
}
