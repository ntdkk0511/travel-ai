/**
 * useHotelBudget.js
 *
 * ホテル予算の state と、バックエンドに渡す値を返すカスタムフック。
 *
 * 使い方:
 *   const { hotelBudget, setHotelBudget, getBudgetForRequest } = useHotelBudget();
 *
 *   // fetch 送信時
 *   const bodyData = { ... };
 *   Object.assign(bodyData, getBudgetForRequest());  // 空なら何も追加しない
 */

import { useState } from "react";

export function useHotelBudget() {
    const [hotelBudget, setHotelBudget] = useState("");

    /**
     * リクエストボディ用: 値が入力されていれば { hotelBudget: number } を返す。
     * 空 or 0 以下の場合は空オブジェクトを返す（任意項目なので）。
     */
    function getBudgetForRequest() {
        const num = Number(hotelBudget);
        if (!hotelBudget || num <= 0) return {};
        return { hotelBudget: num };
    }

    return { hotelBudget, setHotelBudget, getBudgetForRequest };
}