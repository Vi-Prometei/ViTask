package yandex

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func UploadDiskFile(c *fiber.Ctx) error {
	token, err := GetUserToken(c)
	if err != nil {
		return err
	}

	// Получаем файл из запроса
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Файл не получен"})
	}
	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Ошибка чтения файла"})
	}
	defer file.Close()

	diskPath := "disk:/" + fileHeader.Filename

	// Получаем upload URL
	apiUrl := "https://cloud-api.yandex.net/v1/disk/resources/upload?path=" + diskPath + "&overwrite=true"
	req, _ := http.NewRequest("GET", apiUrl, nil)
	req.Header.Set("Authorization", "OAuth "+token)
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		return c.Status(500).JSON(fiber.Map{"error": "Ошибка получения upload URL"})
	}
	var res struct {
		Href string `json:"href"`
	}
	json.NewDecoder(resp.Body).Decode(&res)
	resp.Body.Close()

	// Загрузка файла на полученный URL
	buf := new(bytes.Buffer)
	io.Copy(buf, file)
	uploadReq, _ := http.NewRequest("PUT", res.Href, bytes.NewReader(buf.Bytes()))
	uploadResp, err := http.DefaultClient.Do(uploadReq)
	if err != nil || (uploadResp.StatusCode != 201 && uploadResp.StatusCode != 202) {
		return c.Status(500).JSON(fiber.Map{"error": "Ошибка загрузки файла"})
	}
	uploadResp.Body.Close()

	return c.JSON(fiber.Map{
		"name": fileHeader.Filename,
		"path": diskPath,
	})
}
