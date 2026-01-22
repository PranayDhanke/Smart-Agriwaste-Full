package handlers

import (
	"context"
	"net/http"

	"agri-api/config"
	"agri-api/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetRecommendation(c *gin.Context) {
	product := c.Query("product")
	moisture := c.Query("moisture")
	intendedUse := c.Query("intendedUse")
	lang := c.DefaultQuery("lang", "en")
	filter := bson.M{
		"productId":   product,
		"moisture":    moisture,
		"intendedUse": intendedUse,
		"isActive":    true,
	}
	var rec models.Recommendation

	err := config.RecommendationCollection.
		FindOne(context.Background(), filter).
		Decode(&rec)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Recommendation not found",
		})
		return
	}
	if _, ok := rec.Process[lang]; !ok {
		lang = "en"
	}
	c.JSON(http.StatusOK, gin.H{
		"process":     rec.Process[lang],
		"finalOutput": rec.FinalOutput[lang],
		"benefits":    rec.Benefits[lang],
		"notes":       rec.Notes[lang],
	})
}
