// import puppeteer from 'puppeteer';
//  import express from 'express';
// import pkg from 'express';
// const express = pkg.default || pkg;
// import axios from 'axios';
// import * as cheerio from 'cheerio';

const express = require('express');
const cheerio = require('cheerio');
// const {chromium} = require('playwright');
const axios = require('axios');
const puppeteer = require('puppeteer');

async function check(){
    console.log('🐛 Puppeteer default cache dir:', process.env.PUPPETEER_CACHE_DIR);
    console.log('🐛 Puppeteer executable path:', await puppeteer.executablePath?.());
}
check();

const app = express();
const PORT = process.env.PORT || 5000;
let screenshot = false;
const attr = [
    'src', 'href', 'title',
    'name', 'data', 'id', 'class',
    'width', 'alt', 'height', 'type',
    'checked', 'maxlength', 'role', 'style', 'target'
];
const commands = {
    url: (data, stack, url) => {
        if (typeof data !== 'string') {
            throw new Error('Ожидался строковый URL');
        }
        url = data
        console.log('[Команда URL] Установлен адрес:', url);
    },
    click: (data, stack) => stack.push({ click: data }),
    data: (data, stack) => stack.push({ data: data }),
    screenshot: (data) => {
        if (data === 'true') {
            screenshot = true;
        } else {
            screenshot = false;
        }
    },
    wait: (data, stack) => {
        if (!isNaN(Number(data))) {
            stack.push({ wait: Number(data) })
        } else {
            throw new Error('In Wait not Number');
        }
    },
    input: (data, stack) => stack.push({ input: data }),
    alldata: (data, stack) => stack.push({ alldata: data }),
}

async function safeClick(page, selector) {
    page.removeAllListeners('request');

    // await page.setRequestInterception(true);
    // page.on('request', (req) => {
    //     const url = req.url();
    //     if (/\.(pdf|exe|zip|rar|dmg|apk|msi|bat|scr)(\?|#|$)/i.test(url)) {
    //         console.warn('⛔ Блокирую скачивание:', url);
    //         req.abort();
    //     } else {
    //         req.continue();
    //     }
    // });

    await page.route('**/*', (route) => {
        const url = route.request().url();
        if (/\.(pdf|exe|zip|rar|dmg|apk|msi|bat|scr)(\?|#|$)/i.test(url)) {
            console.warn('⛔ Блокирую скачивание:', url);
            route.abort();
        } else {
            route.continue();
        }
    });
    // const client = await page.target().createCDPSession();
    // await client.send('Page.setDownloadBehavior', {
    //     behavior: 'deny'
    // });


    await page.evaluate(() => {
        document.querySelectorAll('a[download]').forEach(a => a.removeAttribute('download'));
        document.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (/\.(pdf|exe|zip|rar|dmg|apk|msi|bat|scr)(\?|#|$)/i.test(href)) {
                a.setAttribute('href', '#');
            }
        });
    });


    const isSafe = await page.$eval(selector, el => {
        const href = el.getAttribute?.('href') || '';
        const download = el.hasAttribute?.('download') || false;
        const text = (el.textContent || '').toLowerCase();
        const isBadText = /(скачать|download|pdf|exe|zip|apk|установить)/.test(text);
        return !download && !/\.(pdf|exe|zip|rar|dmg|apk|msi|bat|scr)(\?|#|$)/i.test(href) && !isBadText;
    });

    if (!isSafe) {
        console.log('❌ Click not possible.');
    }
    await page.click(selector);
}

function func() {
    return {
        input: async (page, data) => {
            try {
                await page.waitForSelector(data[0]);
            } catch (err) {
                if (err.name === 'TimeoutError') {
                    return { Error: `Element ${data} not found` };
                }
            }
            await page.type(data[0], data[1]);
            console.log('Function input');
        },
        wait: async (page, ms) => {
            console.log('Function wait');
            await new Promise(resolve => setTimeout(resolve, ms));
        },
        click: async (page, data) => {
            try {
                await page.waitForSelector(data);
            } catch (err) {
                if (err.name === 'TimeoutError') {
                    return { Error: `Element ${data} not found` };
                }
            }
            await safeClick(page, data);
            console.log('Function click');
        },
        data: async (page, data) => {
            try {
                console.log('Function data');
                const [select, wot] = data;
                try {
                    await page.waitForSelector(select);
                } catch (err) {
                    if (err.name === 'TimeoutError') {
                        return { Error: `Element ${data[0]} not found` };
                    }
                }
                if (wot === 'text') {
                    return { success: await page.$eval(select, el => el.textContent.trim()) };
                } if (attr.includes(wot)) {
                    return { success: await page.$eval(select, (el, wot) => el.getAttribute(wot), wot) };
                } if (wot === 'html') {
                    return { success: await page.$eval(select, el => el.innerHTML) };
                } if (wot === 'Style') {
                    const style = await page.$eval(select, el => {
                        const computed = window.getComputedStyle(el);
                        const result = {};
                        for (let i = 0; i < computed.length; i++) {
                            const prop = computed[i];
                            result[prop] = computed.getPropertyValue(prop);
                        }
                        return result;
                    })
                    console.log(style);
                    return { success: style };
                }
                return { Error: `Enter second part in array ${data[0]}` };
            } catch (err) {
                if (err.name === 'TimeoutError') {
                    return { Error: `Element ${data[0]} not found` };
                }
            }
        },
        alldata: async (page, data) => {
            try {
                console.log('Function alldata');
                console.log(data);
                const [select, wot] = data;
                try {
                    await page.waitForSelector(select);
                } catch (err) {
                    if (err.name === 'TimeoutError') {
                        return { Error: `Element ${data[0]} not found` };
                    }
                }
                console.log(wot);
                if (wot === 'text') {
                    console.log('text');
                    return {
                        success: await page.$$eval(select, els =>
                            els.map(el => el.textContent.trim())
                        )
                    };
                } if (attr.includes(wot)) {
                    console.log('attr');
                    return {
                        success: await page.$$eval(select, (els, attr) =>
                            els.map(el => el.getAttribute(attr)
                            ), wot)
                    }
                } if (wot === 'html') {
                    console.log('html');
                    return {
                        success: await page.$$eval(select, els =>
                            els.map(el => el.innerHTML)
                        )
                    }
                } if (wot === 'Style') {
                    return {
                        success: await page.$$eval(select, els =>
                            els.map(el => {
                                const computed = window.getComputedStyle(el)
                                const result = {};
                                for (let i = 0; i < computed.length; i++) {
                                    const prop = computed[i];
                                    result[prop] = computed.getPropertyValue(prop);
                                }
                                return result;
                            })
                        )
                    }
                }
                return { Error: `Enter second part in array ${data[0]}` };
            } catch (err) {
                if (err.name === 'TimeoutError') {
                    return { Error: `Element ${data[0]} not found` };
                }
            }
        }
    }
}

async function main(stack, url) {
    const answer = [];
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: '/opt/render/.cache/puppeteer/chrome/linux-138.0.7204.168/chrome-linux64/chrome',
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote',
                '--single-process',
            ],
        });
    } catch (err) {
        console.error('Browser Error:', err);
        throw new Error('Browser not work: error');
    }
    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });

        for (let i = 0; i < stack.length; i++) {
            const waitFor = stack[i + 1] ? Object.values(stack[i + 1])[0] : 'none';
            answer.push(await func()[Object.keys(stack[i])](page, ...Object.values(stack[i]), waitFor, answer));
        }
        if (screenshot) {
            await page.screenshot({ path: 'screenshot.png' });
        }
        await browser.close();
        return answer;
    } catch (err) {
        if (err.name === 'TimeoutError') {
            console.log(err);
        }
    }

}
function dellNull(data) {
    if (!Array.isArray(data)) {
        return data;
    }
    const array = [];
    const no = [null, undefined, NaN];
    for (let i = 0; i < data.length; i++) {
        if (!no.includes(data[i])) {
            array.push(data[i])
        }
    }
    return array;
}
function checkArray(data) {
    if (typeof data === 'string' && data.startsWith('[') && data.endsWith(']')) {
        const res = data.slice(data.indexOf('[') + 1, data.length - 1);
        if (data.includes(',')) {
            const value1 = res.slice(0, res.indexOf(',')).trim();
            const value2 = res.slice(res.indexOf(',') + 1).trim();
            return [value1, value2];
        }
        return res;
    } else {
        return data;
    }
}

async function textParser(data) {
    const string = data.toString().trim();
    let url = '';
    const stack = [];
    console.log(string);
    const res = string.split(';');
    console.log(res);
    console.log('was Parse');

    let key, value;
    for (let i = 0; i < res.length; i++) {
        value = res[i].slice(res[i].indexOf(':') + 1).trim();
        if (value.includes(';')) {
            value = value.slice(0, value.length - 1);
        }
        key = res[i].slice(0, res[i].indexOf(':')).trim();

        if (typeof commands[key] !== 'function') {
            console.log(`Not find command ${key}`);
            continue;
        }
        if (key === 'url') {
            url = value;
        }
        console.log({ [key]: value });

        try {
            commands[key ? key : 'none'](checkArray(value), stack);
        } catch (err) {
            console.log(key, value);
            throw new Error(`Unexpected syntax in ${key}:${value}`);
        }
    }
    if (url === '') {
        return "Request don't include URL, correct this";
    }

    stack.forEach(el => console.log(el));

    return await main(stack, url);
}

app.post('/mainPars', express.text(), async (req, res) => {
    const result = dellNull(await textParser(req.body));
    console.log('result: ' + result);
    res.send(result);
});


async function cheerioParser(data) {
    try {
        const { url } = data;
        const stack = [];
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        let value, key;

        for (let i = 0; i < Object.keys(data).length; i++) {
            value = Object.values(data)[i];
            key = Object.keys(data)[i];
            console.log('value: ' + value);

            if (Array.isArray(value)) {
                for (let v of value) {
                    if (v === 'text') {
                        stack.push($(key).text());
                    } if (v === 'html') {
                        stack.push($(key).html());
                    } if (!v.length) {
                        stack.push('Enter VALUE');
                    } if (attr.includes(v)) {
                        stack.push($(key).attr(v));
                    }
                }
            }

            if (key === 'url') {
                continue;
            } if (!value.length) {
                console.log('Enter VALUE');
                stack.push(`Enter VALUE`);
                continue;
            } if (value === 'text') {
                stack.push($(key).text());
            } if (value === 'html') {
                stack.push($(key).html());
            } if (attr.includes(value)) {
                stack.push($(key).attr(value));
            }
        }
        console.log(stack);
        return stack;
    } catch (err) {
        console.log(err);
        return err;
    }
}

app.post('/easePars', express.json(), async (req, res) => {
    const result = await cheerioParser(req.body);
    res.send(result);
})

app.listen(PORT, () => {
    console.log(`server work on http://localhost:${PORT}`);
})