build:
	docker build -t telegram-gpt-chat-bot .

run:
	docker run -d -p 3000:3000 --name telegram-gpt-chat-bot --rm telegram-gpt-chat-bot
