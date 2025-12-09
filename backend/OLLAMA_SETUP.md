# Ollama Setup - Lokalny model AI dla planów treningowych

## Co to jest Ollama?

Ollama to darmowe narzędzie do uruchamiania lokalnych modeli AI na twoim komputerze. Nie wymaga API keys ani połączenia z internetem (po pobraniu modelu).

## Instalacja Ollama

### macOS / Linux:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### macOS (Homebrew):
```bash
brew install ollama
```

### Windows:
Pobierz instalator z: https://ollama.com/download

## Pobranie modelu Qwen2.5

Po instalacji Ollama, pobierz model:

```bash
ollama pull qwen2.5
```

Dostępne warianty (od najmniejszego do największego):
- `qwen2.5:0.5b` - najmniejszy, najszybszy (wymaga ~0.5GB RAM)
- `qwen2.5:1.5b` - szybki, dobra jakość (wymaga ~1.5GB RAM)
- `qwen2.5:3b` - balans jakości i prędkości (wymaga ~3GB RAM)
- `qwen2.5:7b` - dobra jakość (wymaga ~7GB RAM) **← ZALECANY**
- `qwen2.5:14b` - bardzo dobra jakość (wymaga ~14GB RAM)
- `qwen2.5:32b` - najlepsza jakość (wymaga ~32GB RAM)

**Zalecana wersja dla tej aplikacji:**
```bash
ollama pull qwen2.5:7b
```

Jeśli chcesz użyć innego wariantu, zmień `MODEL_NAME` w `src/services/openai.service.js`:
```javascript
const MODEL_NAME = 'qwen2.5:7b'; // lub inna wersja
```

## Uruchomienie Ollama

Ollama musi działać w tle podczas korzystania z aplikacji:

```bash
ollama serve
```

Lub w tle:
```bash
nohup ollama serve &
```

## Test działania

### 1. Sprawdź czy Ollama działa:
```bash
curl http://localhost:11434
```

Powinno zwrócić: `Ollama is running`

### 2. Test modelu:
```bash
ollama run qwen2.5 "Hello, how are you?"
```

### 3. Test z aplikacji:
```bash
cd backend
node scripts/test-ollama.js
```

## Rozwiązywanie problemów

### Problem: "Ollama is not running"
**Rozwiązanie:** Uruchom Ollama:
```bash
ollama serve
```

### Problem: "Model not found"
**Rozwiązanie:** Pobierz model:
```bash
ollama pull qwen2.5
```

### Problem: Wolne generowanie
**Rozwiązanie:** 
- Użyj mniejszego modelu (np. `qwen2.5:3b`)
- Zamknij inne aplikacje zajmujące RAM
- Upewnij się że masz wystarczająco pamięci RAM

### Problem: Model generuje nieprawidłowy JSON
**Rozwiązanie:**
- Upewnij się że używasz co najmniej `qwen2.5:7b`
- Mniejsze modele mogą mieć problemy ze złożonymi strukturami JSON

## Porównanie z OpenAI

| Aspekt | Ollama (Qwen2.5) | OpenAI (GPT-4) |
|--------|------------------|----------------|
| Koszt | Darmowy | ~$0.03/1K tokenów |
| Prędkość | Zależy od sprzętu | Szybkie |
| Prywatność | 100% lokalne | Dane w chmurze |
| Jakość | Bardzo dobra | Najlepsza |
| Wymagania | 8GB+ RAM | Tylko internet |

## Przełączenie z powrotem na OpenAI

Jeśli chcesz wrócić do OpenAI GPT-4, zmień w `src/services/openai.service.js`:

```javascript
// Zamiast Ollama:
const ollamaClient = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama',
});

// Użyj OpenAI:
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// I zmień model:
const MODEL_NAME = 'gpt-4o';
```

## Więcej informacji

- Dokumentacja Ollama: https://ollama.com/docs
- Lista modeli: https://ollama.com/library
- Qwen2.5 info: https://ollama.com/library/qwen2.5
