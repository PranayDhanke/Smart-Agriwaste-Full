package routes

import (
	"agri-api/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {
	router.GET("/recommendation", handlers.GetRecommendation)
}
