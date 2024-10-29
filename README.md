# GLaDOS Assistant

![GLaDOS Banner](./glados-banner.png)

![GitHub](https://img.shields.io/github/license/wiibleyde/glados-assistant)
![GitHub package.json version](https://img.shields.io/github/package-json/v/wiibleyde/glados-assistant)![GitHub issues](https://img.shields.io/github/issues/wiibleyde/glados-assistant)
![GitHub pull requests](https://img.shields.io/github/issues-pr/wiibleyde/glados-assistant)![GitHub top language](https://img.shields.io/github/languages/top/wiibleyde/glados-assistant)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/cbed5be6cea84e34911753e187c5efed)](https://app.codacy.com/gh/Wiibleyde/GLaDOS-Assistant/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

## Description

GLaDOS Assistant is a simple discord bot that can be used for multiple things, including IA functionalities, and more.

## Table of Contents
- [Description](#description)
- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [License](#license)
- [Authors](#authors)
- [Acknowledgments](#acknowledgments)

## Features

- [x] IA functionalities
    - [x] Chat with the bot by simply mentioning it (with a real discussion)
- [x] Birthday reminder
- [x] Quiz functionalities
- [x] Fun commands
    - [x] cat pictures
- [x] Debug functionalities

## Prerequisites

- Node.js
- Yarn
- MariaDB database
    - *Windows docker don't work well with the Prisma ORM*
- Discord bot token
    - With good intents

## Installation

1. Clone the repository
2. Install the dependencies with `yarn`
3. Create a `.env` file at the root of the project with the following content:
    ```env
    DISCORD_TOKEN=your_discord_token
    DISCORD_CLIENT_ID=your_discord_bot_client_id

    GLADOS_HOME_GUILD=glados_home_guild_id
    REPORT_CHANNEL=report_channel_id

    OWNER_ID=your_discord_user_id

    LOGS_WEBHOOK_URL=your_discord_webhook_url

    DATABASE_URL="mysql_connection_url"

    GOOGLE_API_KEY=your_google_api_key
    ```
4. Run the prisma migrations with `yarn prisma db push`
5. Build the project with `yarn build`
6. Start the bot with `yarn start`

## License

This project is licensed under the GPL-2.0 License - see the [LICENSE](LICENSE) file for details

## Authors

- [**Wiibleyde**](https://github.com/wiibleyde)

## Acknowledgments

- [**Discord.js**](https://discord.js.org/)
- [**Prisma ORM**](https://www.prisma.io/)
- [**Gemini**](https://gemini.google.com/)
- [**TheCatAPI**](https://thecatapi.com/)

![](https://forthebadge.com/images/badges/built-with-love.svg)
![](https://forthebadge.com/images/badges/made-with-typescript.svg)
![](https://forthebadge.com/images/badges/open-source.svg)
![](https://forthebadge.com/images/badges/uses-git.svg)
![](https://forthebadge.com/images/badges/uses-yarn.svg)
