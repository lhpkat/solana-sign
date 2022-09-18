import axios from 'axios';
import qs from 'qs';


const baseUrl = "http://124.220.51.86/api";

const get = async (url, params, takeControl) => {
    return axios.get(url, {
        withCredentials: false,
        params,
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json'
        },
        paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'brackets' })
        },
    })
    .then((res) => {
        if (takeControl) {
            return res
        }
        return res?.data
    })
}

const post = async (url, data, takeControl) => {
    let preload = data;

    if (typeof data !== 'undefined' && typeof data === 'object' && !(data instanceof FormData)) {
        preload = qs.stringify(data)
    }

    return axios.post(
        url,
        preload,
        {
            withCredentials: false,
        }
    ).then((res) => {
        if (takeControl) {
            return res
        }
        return res.data
    })
}

export const uploadPdf = (address, params) => {
    return post(`${baseUrl}/upload/${address}`, params);
}

// 创建签名文件
export const requestCreateSign = (params) => {
    return post(`${baseUrl}/create_sign`, params);
}

// 查看创建者文件
export const fetchCreateFile = (params) => {
    return get(`${baseUrl}/get_create_file`, params);
}

// 查看签名者文件
export const fetchSignFile = (params) => {
    return get(`${baseUrl}/get_sign_file`, params);
}

// 文件签名操作
export const fetchToSign = (params) => {
    return get(`${baseUrl}/sign_file`, params);
}
