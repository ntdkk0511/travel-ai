import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataFile = path.join(__dirname, "../data/plans.json");

class PlanModel {
  constructor(id, userId, title, plan, startDate, endDate, nights, stayLocation, createdAt) {
    this.id = id;
    this.userId = userId;
    this.title = title;       // ユーザーが入力した旅行内容（prompt）をタイトルに使う
    this.plan = plan;         // Geminiが生成したプランテキスト
    this.startDate = startDate;
    this.endDate = endDate;
    this.nights = nights;
    this.stayLocation = stayLocation;
    this.createdAt = createdAt;
  }

  // plans.json を全件読み込む
  static getAllPlans(file = dataFile) {
    try {
      const data = fs.readFileSync(file, "utf-8");
      return JSON.parse(data || "[]");
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }

  // 保存
  save(file = dataFile) {
    const plans = PlanModel.getAllPlans(file);
    plans.push(this);
    fs.writeFileSync(file, JSON.stringify(plans, null, 2));
    return this;
  }

  // プラン作成 & 保存
  static createPlan(userId, title, plan, startDate, endDate, nights, stayLocation, file = dataFile) {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const newPlan = new PlanModel(id, userId, title, plan, startDate, endDate, nights, stayLocation, createdAt);
    newPlan.save(file);
    return newPlan;
  }

  // userIdで絞り込んで取得
  static getPlansByUserId(userId, file = dataFile) {
    const plans = PlanModel.getAllPlans(file);
    return plans.filter((p) => p.userId === userId);
  }

  // idで1件取得
  static getPlanById(id, file = dataFile) {
    const plans = PlanModel.getAllPlans(file);
    return plans.find((p) => p.id === id);
  }

  // idで削除
  static deletePlanById(id, file = dataFile) {
    const plans = PlanModel.getAllPlans(file);
    const filtered = plans.filter((p) => p.id !== id);
    fs.writeFileSync(file, JSON.stringify(filtered, null, 2));
  }
}

export default PlanModel;