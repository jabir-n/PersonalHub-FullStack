const API_URL = "http://127.0.0.1:8000"

export async function apiFetch(url, options = {}) {

    let token = localStorage.getItem("access")

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    }

    let response = await fetch(
        API_URL + url,
        options
    )

    if (response.status !== 401) {
        return response
    }

    const refresh = localStorage.getItem("refresh")

    if (!refresh) {
        return response
    }

    const refreshResponse = await fetch(
        API_URL + "/api/refresh/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refresh: refresh,
            }),
        }
    )

    if (!refreshResponse.ok) {

        localStorage.removeItem("access")
        localStorage.removeItem("refresh")

        return response

    }

    const refreshData = await refreshResponse.json()

    localStorage.setItem(
        "access",
        refreshData.access
    )

    options.headers.Authorization =
        `Bearer ${refreshData.access}`

    response = await fetch(
        API_URL + url,
        options
    )

    return response

}