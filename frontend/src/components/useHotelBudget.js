/**
 * useHotelBudget.js
 *
 * ホテル予算 + 全体予算の state と、バックエンドに渡す値を返すカスタムフック。
 *
 * 使い方:
 *   const { hotelBudget, setHotelBudget, totalBudget, setTotalBudget, getBudgetForRequest } = useHotelBudget();
 *
 *   // fetch 送信時（stayType と nights を渡す）
 *   Object.assign(bodyData, getBudgetForRequest(stayType, nights));
 *
 * Geminiへ渡すケース:
 *   全体あり & ホテルあり → ホテル1泊○円 + 観光・食費○円（全体 - ホテル×泊数）
 *   全体あり & ホテルなし → 全体予算○円のみ
 *   全体なし & ホテルあり → ホテル1泊○円のみ
 *   全体なし & ホテルなし → 予算情報なし（空オブジェクト）
 */

import { useState } from "react";

export function useHotelBudget() {
    const [hotelBudget, setHotelBudget] = useState("");
    const [totalBudget, setTotalBudget] = useState("");

    /**
     * @param {string} stayType - "日帰り" | "宿泊"
     * @param {number} nights   - 宿泊数
     * @returns {object}        - bodyData にマージするオブジェクト
     */
    function getBudgetForRequest(stayType, nights) {
        const hotel = Number(hotelBudget);
        const total = Number(totalBudget);
        const hasHotel = stayType === "宿泊" && hotelBudget && hotel > 0;
        const hasTotal = totalBudget && total > 0;

        if (!hasHotel && !hasTotal) return {};

        const result = {};

        if (hasHotel) result.hotelBudget = hotel;

        if (hasTotal && hasHotel) {
            // 全体 - ホテル×泊数 = 観光・食費予算
            const activityBudget = total - hotel * (nights || 1);
            result.totalBudget = total;
            result.activityBudget = activityBudget > 0 ? activityBudget : 0;
        } else if (hasTotal) {
            // ホテル予算なし → 全体だけ渡す
            result.totalBudget = total;
        }

        return result;
    }

    return {
        hotelBudget, setHotelBudget,
        totalBudget, setTotalBudget,
        getBudgetForRequest,
    };
}