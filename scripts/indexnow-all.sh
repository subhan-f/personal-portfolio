#!/bin/bash

# Your IndexNow key (from GitHub secret or wherever)
KEY="YOUR_INDEXNOW_KEY_HERE"

# The domain (without protocol) — blog is now served under the same domain
DOMAIN="subhanfarrakh.com"

# IndexNow endpoint (Google, Bing, Yandex all listen here)
ENDPOINT="https://api.indexnow.org/indexnow"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to extract all URLs from a sitemap index or sitemap
extract_urls() {
  local sitemap_url="$1"
  curl -s "$sitemap_url" | grep -oP "(?<=<loc>)[^<]+"
}

echo "🔍 Extracting URLs from sitemaps..."

# Portfolio URLs
echo "  Portfolio:"
extract_urls "https://$DOMAIN/sitemap-index.xml" | while read -r url; do
  echo -n "    $url ... "
  # Submit to IndexNow (key, host, url)
  response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{\"host\":\"$DOMAIN\",\"key\":\"$KEY\",\"urlList\":[\"$url\"]}")
  if [ "$response" = "200" ] || [ "$response" = "202" ]; then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗ (HTTP ${response})${NC}"
  fi
done

# Blog URLs (now under the same domain at /blog/sitemap-index.xml)
echo "  Blog:"
extract_urls "https://$DOMAIN/blog/sitemap-index.xml" | while read -r url; do
  echo -n "    $url ... "
  response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{\"host\":\"$DOMAIN\",\"key\":\"$KEY\",\"urlList\":[\"$url\"]}")
  if [ "$response" = "200" ] || [ "$response" = "202" ]; then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗ (HTTP ${response})${NC}"
  fi
done

echo ""
echo "✅ All URLs submitted to IndexNow (Google, Bing, Yandex)."