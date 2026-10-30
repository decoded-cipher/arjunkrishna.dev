---
name: MGU Result Scraper
date: "2022-06"
order: 12
homeLine: fetched exam results from the university portal and emailed every student theirs as a PDF.
stack: Node.js, Playwright, MongoDB, RabbitMQ, ExcelJS
links:
  source: https://github.com/decoded-cipher/mgu-result-scraper
  writeup: https://blog.inovuslabs.org/mgu-result-scrapper/
---

An automation pipeline that pulls a whole batch's university results in about a minute. Headless Playwright scraping, password-protected PDFs emailed to every student, and ready-made mark lists and analytics for teachers, queued on RabbitMQ.
