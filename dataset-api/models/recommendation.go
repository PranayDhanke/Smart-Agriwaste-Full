package models

type Recommendation struct {
	ProductId   string              `bson:"productId"`
	Moisture    string              `bson:"moisture"`
	IntendedUse string              `bson:"intendedUse"`

	Process     map[string][]string `bson:"process"`
	FinalOutput map[string]string   `bson:"finalOutput"`
	Benefits    map[string]string   `bson:"benefits"`
	Notes       map[string]string   `bson:"notes"`

	IsActive bool `bson:"isActive"`
}
