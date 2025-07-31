package yandex

import (
	"encoding/json"
	"github.com/gofiber/fiber/v2"
	"io"
	"net/http"
)

func DownloadDiskFile(c *fiber.Ctx) error {
	token, err := GetUserToken(c)
	if err != nil {
		return err
	}
	path := c.Query("path")
	if path == "" {
		return c.Status(400).SendString("Не указан путь")
	}
	// Получаем download URL
	apiUrl := "https://cloud-api.yandex.net/v1/disk/resources/download?path=" + path
	req, _ := http.NewRequest("GET", apiUrl, nil)
	req.Header.Set("Authorization", "OAuth "+token)
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		return c.Status(500).SendString("Ошибка получения download URL")
	}
	var res struct {
		Href string `json:"href"`
	}
	json.NewDecoder(resp.Body).Decode(&res)
	resp.Body.Close()

	// Проксируем файл
	fileResp, err := http.Get(res.Href)
	if err != nil || fileResp.StatusCode != 200 {
		return c.Status(500).SendString("Ошибка скачивания файла")
	}
	defer fileResp.Body.Close()
	c.Response().Header.Set("Content-Disposition", "attachment; filename="+c.Query("filename", "file"))
	io.Copy(c.Response().BodyWriter(), fileResp.Body)
	return nil
}
