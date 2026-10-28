import axios from "axios";

export default ({
    req
}) => {
    if (typeof window === "undefined") {
        // means server
        /// this is used becayse get intail props might run on the server or the client (watch 236 video number);
        return axios.create({
            baseURL: "http://www.kticketing-app-prod.site/",
            headers: req.headers
        })
    } else {
        return axios.create({
            baseURL: "/"
        })
    }

}