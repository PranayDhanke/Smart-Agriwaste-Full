package models

type Recommendation struct {
	ProductId   string `bson:"productId"`
	Moisture    string `bson:"moisture"`
	IntendedUse string `bson:"intendedUse"`

	Process             map[string][]string `bson:"process"`
	FinalOutput         map[string]string   `bson:"finalOutput"`
	Benefits            map[string]string   `bson:"benefits"`
	Notes               map[string]string   `bson:"notes"`
	RequiredMaterials   map[string][]string `bson:"requiredMaterials"`
	ProcessDuration     map[string]string   `bson:"processDuration"`
	RequiredEquipment   map[string][]string `bson:"requiredEquipment"`
	RecommendedFor      map[string][]string `bson:"recommendedFor"`
	EnvironmentalImpact map[string]string   `bson:"environmentalImpact"`

	IsActive bool `bson:"isActive"`
}
