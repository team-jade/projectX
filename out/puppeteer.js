"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require('puppeteer');
const pptr = require('puppeteer-core');
const chromeLauncher = require('chrome-launcher');
const request = require('request');
const util = require('util');
const TreeNode_1 = require("./TreeNode");
class Puppeteer {
    // Default properties for the Puppeteer class.
    constructor() {
        this._headless = false;
        this._executablePath = '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome';
        this._pipe = true;
        this._url = 'http://localhost:3000';
        this._page = '';
        this._browser = '';
    }
    // Creates an instance of puppeteer browser and page,
    // opens to _url, defaults to localhost:3000
    async start() {
        // console.log('before chrome launch');
        // const chrome = await chromeLauncher.launch({
        // 	startingUrl: this._url,
        // 	chromeFlags: ['--disable-gpu', '--no-sandbox'],
        // 	enableExtensions: true
        // });
        // console.log('after chrome launch', chrome.port);
        // const resp = await util.promisify(request)(`http://localhost:${chrome.port}/json/version`);
        // console.log(resp, 'hereeee')
        // const { webSocketDebuggerUrl } = JSON.parse(resp.body);
        // console.log(webSocketDebuggerUrl, 'heasdfadsfksh;kreeee')
        // this._browser = await pptr.connect({ browserWSEndpoint: webSocketDebuggerUrl });
        // console.log('ok....');
        // this._page = await this._browser.pages()
        // 	.then((pageArr: any) => {
        // 			return pageArr[0];
        // 	});
        // const resp = util.promisify(request)
        // const pathToExtension = require('path').join(__dirname, 'chrome-extensions');
        this._browser = await pptr.launch({
            headless: this._headless,
            executablePath: this._executablePath,
            pipe: this._pipe,
        }).catch((err) => console.log(err));
        // 	const targets = await browser.targets();
        // const backgroundPageTarget = targets.find(target => target.type() === 'background_page');
        // const backgroundPage = await backgroundPageTarget.page();
        this._page = await this._browser.pages()
            .then((pageArr) => {
            return pageArr[0];
        });
        this._page.goto(this._url, { waitUntil: 'networkidle0' });
        // await this._page.goto(webSocketDebuggerUrl);
        this._page.on('console', (log) => console.log('mutation'));
        // await this._page.evaluate(() => {
        // 	const target = document.documentElement;
        // 	var mutationObserver = new MutationObserver(function(mutations) {
        // 		mutations.forEach(function(mutation) {
        // 			console.log(mutation);
        // 		});
        // 	});
        // 	const config = {
        // 		attributes: true,
        // 		characterData: true,
        // 		childList: true,
        // 		subtree: true,
        // 		attributeOldValue: true,
        // 		characterDataOldValue: true
        // 	}
        // 	return mutationObserver.observe(target, config)
        //  })
        return await this._page;
    }
    // Recursive React component scraping algorithm
    scrape() {
        // All code inside .evaluate is executed in the pages context
        const reactData = this._page.evaluate(async () => {
            // Access the React Dom
            // & create entry point for fiber node through DOM element
            const _entry = (() => {
                // @ts-ignore
                const domElements = document.querySelector('body').children;
                for (let el of domElements) {
                    // @ts-ignore
                    if (el._reactRootContainer) {
                        // @ts-ignore
                        return el._reactRootContainer._internalRoot.current;
                    }
                }
            })();
            // Define function that traverses the fiber tree, starting from the entry point
            function fiberWalk(entry) {
                let dataArr = [], globalId = 1;
                // Recursively traversing through the fiber tree, pushing the node object into the dataArr array
                function traverse(root, level, parentId) {
                    if (root.sibling !== null) {
                        if (typeof root.sibling.type === 'function' && root.sibling.type.name) {
                            globalId += 1;
                            dataArr.push({
                                "name": root.sibling.type.name,
                                "level": `${level}`,
                                "id": `${globalId}`,
                                "parentId": `${parentId}`,
                                "props": JSON.stringify(Object.keys(root.sibling.memoizedProps))
                            });
                        }
                        traverse(root.sibling, level, parentId);
                    }
                    if (root.child !== null) {
                        if (typeof root.child.type === 'function' && root.child.type.name) {
                            parentId += 1;
                            globalId += 1;
                            dataArr.push({
                                "name": root.child.type.name,
                                "level": `${level}`,
                                "id": `${globalId}`,
                                "parentId": `${parentId}`,
                                "props": JSON.stringify(Object.keys(root.child.memoizedProps))
                            });
                        }
                        traverse(root.child, level + 1, parentId);
                    }
                }
                traverse(entry, 0, 0);
                // Setting root parent to an empty string
                dataArr[0].parentId = '';
                console.log(dataArr);
                function buildTree(dataArr) {
                    let processeddataArr = [];
                    let TreeData;
                    dataArr.forEach((el) => {
                        if (el.parentId === '') {
                            TreeData = new TreeNode_1.default(el);
                        }
                    });
                }
                return buildTree(dataArr);
            }
            return fiberWalk(_entry);
        }).catch((err) => { console.log(err); });
        return reactData;
    }
}
exports.default = Puppeteer;
//# sourceMappingURL=Puppeteer.js.map