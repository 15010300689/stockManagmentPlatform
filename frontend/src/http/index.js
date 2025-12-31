import axios from 'axios';
import qs from 'qs';
import originJSONP from 'jsonp';

class Request {
    // 域名
    host = '';
    // axois实例
    axiosInstance = axios.create();
    constructor() {
        this.initAxios();
    }

    /** @desc 初始化axios实例 */
    initAxios() {
        this.axiosInstance = axios.create({
            responseType: 'json',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 20000,
        });

        // 请求拦截
        this.axiosInstance.interceptors.request.use(
            (config) => {
                if (!config.url) {
                    throw new Error('url is error!');
                }

                if (!/^(https?:)?\/\//.test(url)) {
                    url = `${this.host}${url}`;
                }

                config.url = url;

                config.params = {
                    [`${(+new Date()).toString(36).substr(3)}`]: '', // 避免接口缓存
                    ...config.params,
                };
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // 响应拦截 
        this.axiosInstance.interceptors.response.use(
            (response) => this.responseIntercept(response),
            (error) => Promise.reject(error)
        );
    }

    /** @desc 响应拦截 */
    responseIntercept(response) {
        // 正常
        try {
            if (+res.data.code === 0) {
                return res;
            }

            // 服务卡异常信息返回处理
            if (+res.data.state === -1) {
                return Promise.reject(res.data || { msg: '请求失败！' });
            }

            return Promise.reject(res.data || { msg: '请求失败！' });
        } catch (e) {
            return Promise.reject(res.data || { msg: '请求失败！' });
        }
    }
    /**
     * axios get请求
     * @param {string} url 
     * @param {Object} data 
     * @param {Object} config 
     */
    get(url = '', data = {}, config = {}, resType = false) {
        config = {
            params: {
                ...data
            },
            ...config,
        };

        return this.axiosInstance.get(url, config).then(res => resType ? res : res.data);
    }

    /**
     * axios post请求封装
     * @param {String} url
     * @param {Object} data
     * @param {Object} config
     */
    post(url = '', data = {}, config = {}, resType = false) {
        data = qs.stringify({...data});

        return this.axiosInstance.post(url, data, {
            ...{
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                },
                ...config,
            }
        }).then(res => resType ? res : res.data);
    }
    /**
     * axios post请求封装
     * @param {String} url
     * @param {Object} data
     * @param {Object} config
     */
    upload(url = '', formData = {}, config = {}) {
        return this.axiosInstance.post(url, formData, {
            ...{
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                ...config,
            }
        }).then(res => res.data);
    }

    /**
     * jsonp
     * @param {String} url
     * @param {Object} data
     * @param {Object} config
     */
    jsonp(url = '', data = {}, option = {}) {
        function param(dataObj){
            let str = '';
            const keys = Object.keys(dataObj);
            for (let i = 0; i < keys.length; i += 1) {
                const key = keys[i];
                const value = dataObj[key] !== undefined ? dataObj[key] : '';

                str += `&${key}=${encodeURIComponent(value)}`;
            }
            return str ? str.substring(1) : '';
        }

        url += (url.indexOf('?') < 0 ? '?' : '&') + param({ ...data });

        return new Promise((resolve, reject) => {
            originJSONP(url, option, (err, result) => {
                if (!err) {
                    resolve(result);
                } else {
                    reject(err);
                }
            });
        });  
    }
}

const http = new Request();

export default http;