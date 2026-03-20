package handlers

import (
	"context"
	"net/http"

	"agri-api/config"
	"agri-api/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func getLocalizedString(values map[string]string, lang string) string {
	if len(values) == 0 {
		return ""
	}
	if value, ok := values[lang]; ok {
		return value
	}
	return values["en"]
}

func getLocalizedStringSlice(values map[string][]string, lang string) []string {
	if len(values) == 0 {
		return []string{}
	}
	if value, ok := values[lang]; ok {
		return value
	}
	if value, ok := values["en"]; ok {
		return value
	}
	return []string{}
}

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
		"process":             getLocalizedStringSlice(rec.Process, lang),
		"finalOutput":         getLocalizedString(rec.FinalOutput, lang),
		"benefits":            getLocalizedString(rec.Benefits, lang),
		"notes":               getLocalizedString(rec.Notes, lang),
		"requiredMaterials":   getLocalizedStringSlice(rec.RequiredMaterials, lang),
		"processDuration":     getLocalizedString(rec.ProcessDuration, lang),
		"requiredEquipment":   getLocalizedStringSlice(rec.RequiredEquipment, lang),
		"recommendedFor":      getLocalizedStringSlice(rec.RecommendedFor, lang),
		"environmentalImpact": getLocalizedString(rec.EnvironmentalImpact, lang),
	})
}
