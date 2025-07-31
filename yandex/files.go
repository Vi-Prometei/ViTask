package yandex

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// Получить OAuth токен из заголовка Authorization: Bearer {token}
func GetUserToken(c *fiber.Ctx) (string, error) {
	auth := c.Get("Authorization")
	if !strings.HasPrefix(auth, "Bearer ") {
		return "", fiber.NewError(fiber.StatusUnauthorized, "Требуется авторизация через Яндекс")
	}
	return strings.TrimPrefix(auth, "Bearer "), nil
}

// Рекурсивно обходит все файлы на Диске пользователя
func WalkYandexDisk(path, token string, allFiles *[]map[string]string) error {
	apiUrl := "https://cloud-api.yandex.net/v1/disk/resources?path=" + path + "&limit=1000"
	req, _ := http.NewRequest("GET", apiUrl, nil)
	req.Header.Set("Authorization", "OAuth "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fiber.NewError(resp.StatusCode, "Ошибка API Яндекс.Диска")
	}

	var result struct {
		Embedded struct {
			Items []struct {
				Name     string `json:"name"`
				Path     string `json:"path"`
				Type     string `json:"type"`
				MimeType string `json:"mime_type"`
			} `json:"items"`
		} `json:"_embedded"`
	}
	body, _ := ioutil.ReadAll(resp.Body)
	json.Unmarshal(body, &result)

	for _, item := range result.Embedded.Items {
		if item.Type == "dir" {
			// Рекурсивно обходим подпапки
			WalkYandexDisk(item.Path, token, allFiles)
		} else {
			*allFiles = append(*allFiles, map[string]string{
				"name": item.Name,
				"path": item.Path,
			})
		}
	}
	return nil
}

// GET /api/disk/files?q=поиск
func GetDiskFiles(c *fiber.Ctx) error {
	token, err := GetUserToken(c)
	if err != nil {
		return err
	}
	query := strings.ToLower(c.Query("q"))

	var files []map[string]string
	if err := WalkYandexDisk("disk:/", token, &files); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Ошибка при обходе диска"})
	}

	// Фильтрация по имени (если задан запрос)
	var filtered []map[string]string
	if query != "" {
		for _, f := range files {
			if strings.Contains(strings.ToLower(f["name"]), query) {
				filtered = append(filtered, f)
			}
		}
	} else {
		filtered = files
	}

	return c.JSON(fiber.Map{"files": filtered})
}
