package dto

type CreateQuestionDto struct {
	Question      string   `json:"question"`
	ImageUrl      string   `json:"image_url"`
	Options       []string `json:"options"`
	CorrectAnswer int      `json:"correct_answer"`
}

type VoteInputDto struct {
	Vote bool `json:"vote"`
}
