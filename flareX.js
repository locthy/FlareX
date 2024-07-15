//Make by Topgod1st (Tloc)
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');

const queryFilePath = path.join(__dirname, 'query.txt');
const proxyFilePath = path.join(__dirname, 'proxy.txt');
const queryData = fs.readFileSync(queryFilePath, 'utf8').trim().split('\n');
const proxyData = fs.readFileSync(proxyFilePath, 'utf8').trim().split('\n');

const animatedLoading = (durationInMilliseconds) => {
    const frames = ["|", "/", "-", "\\"];
    const endTime = Date.now() + durationInMilliseconds;
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const remainingTime = Math.floor((endTime - Date.now()) / 1000);
            const frame = frames[Math.floor(Date.now() / 250) % frames.length];
            process.stdout.write(`\rChờ đợi lần yêu cầu tiếp theo ${frame} - Còn lại ${remainingTime} giây...`);
            if (Date.now() >= endTime) {
                clearInterval(interval);
                process.stdout.write("\rĐang chờ yêu cầu tiếp theo được hoàn thành.\n");
                resolve();
            }
        }, 250);
    });
};

const checkProxyIP = async (proxy) => {
    try {
        const proxyAgent = new HttpsProxyAgent(proxy);
        const response = await axios.get('https://api.ipify.org?format=json', {
            httpsAgent: proxyAgent
        });
        if (response.status === 200) {
            console.log('\nĐịa chỉ IP của proxy là:', response.data.ip);
        } else {
            console.error('Không thể kiểm tra IP của proxy. Status code:', response.status);
        }
    } catch (error) {
        console.error('Error khi kiểm tra IP của proxy:', error);
    }
};



    
const processQuery = async (query_id, proxy, id) => {
    // Define the getAuth function
    const getAuth = async (config) => {
        try {
            const response = await axios(config);
            return response.data.access_token;  // Adjust according to the actual response structure
        } catch (error) {
            console.error('Error during authentication:', error);
            throw error;
        }
    };

    await checkProxyIP(proxy);
    query_id = query_id.replace(/[\r\n]+/g, '');
    const user_id_match = query_id.match(/user=%7B%22id%22%3A(\d+)/);
    if (!user_id_match) {
        console.error('Không thể tìm thấy user_id trong query_id');
        return;
    }
    const user_id = user_id_match[1];

    const payload = {
        "initData": query_id
    };

    const agent = new HttpsProxyAgent(proxy);

    const config = {
        method: 'post',
        url: `https://back.flareinu.com/auth/telegram`,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            'Origin': 'https://app.flareinu.com',
            'Referer': 'https://app.flareinu.com/',
            'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Android"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
        },
        data: payload,
        httpsAgent: agent
    };

    

    const claimFarms = async () => {
        const claimFarmPayload = {
            "telegramId": user_id
        };

        const auth = await getAuth(config);
        
        const header = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
            'Authorization': `Bearer ${auth}`,
            'Origin': 'https://app.flareinu.com',
            'Referer': 'https://app.flareinu.com/',
            'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Android"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
        };

        const claimTapsConfig = {
            method: 'post',
            url: 'https://back.flareinu.com/api/claim',
            headers: header,
            data: claimFarmPayload,
            httpsAgent: agent,
        };

        const claimRefConfig = {
            method: 'post',
            url: 'https://back.flareinu.com/api/claim-referral',
            headers: header,
            data: claimFarmPayload,
            httpsAgent: agent,
        };

        try {
            const claimResponse = await axios(claimTapsConfig);
            const { balance, planetLvl } = claimResponse.data;
            console.log(`====================Account ${id}: ${user_id}====================`);
            console.log('Claiming Farm....');
            console.log('[Balance]: ', balance);
            console.log('[Planet level]: ', planetLvl);
        } catch (error) {
            console.error('Error while request:', error);
        }

        try {
            const claimRefResponse = await axios(claimRefConfig);
            const balanceRef = claimRefResponse.data.balance;
            console.log('Claiming Referals Point.... ') ;
            console.log('[Balance After Claim]: ', balanceRef);
            
        } catch(error){
            console.log('Error code: ', error);
        }

    };

    try {
        await claimFarms();
    } catch (error) {
        console.error('Error while request:', error);
    }
};

const run = async () => {
    while (true){
        console.log('Tloc github: https://github.com/locthy/FlareX ');
        for (let i = 0; i < queryData.length; i++) {
            await processQuery(queryData[i],proxyData[i], i + 1);
        }
        await animatedLoading(3 * 60 * 60 * 1000 + 10 * 60 * 1000);
        console.log('Tloc github: https://github.com/locthy/FlareX ');
    }
};

run();