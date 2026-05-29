import { describe, it, expect } from "vitest";
import { classifyFood } from "@/lib/services/classification.service";

describe("classifyFood", () => {
  it("识别蔬菜 - 西红柿", () => {
    const result = classifyFood("西红柿");
    expect(result.category).toBe("vegetable");
    expect(result.storageZone).toBe("fridge");
    expect(result.matched).toBe(true);
  });

  it("识别水产 - 三文鱼", () => {
    const result = classifyFood("三文鱼");
    expect(result.category).toBe("seafood");
    expect(result.storageZone).toBe("fridge");
    expect(result.matched).toBe(true);
  });

  it("识别冷冻食品 - 速冻水饺", () => {
    const result = classifyFood("速冻水饺");
    expect(result.category).toBe("frozen");
    expect(result.storageZone).toBe("freezer");
    expect(result.matched).toBe(true);
  });

  it("识别乳制品 - 牛奶", () => {
    const result = classifyFood("牛奶");
    expect(result.category).toBe("dairy");
    expect(result.storageZone).toBe("fridge");
    expect(result.matched).toBe(true);
  });

  it("识别肉类 - 猪肉", () => {
    const result = classifyFood("猪肉");
    expect(result.category).toBe("meat");
    expect(result.storageZone).toBe("fridge");
    expect(result.matched).toBe(true);
  });

  it("子字符串匹配 - 牛肉干", () => {
    const result = classifyFood("牛肉干");
    expect(result.category).toBe("meat");
    expect(result.matched).toBe(true);
  });

  it("无法识别的食物返回 other", () => {
    const result = classifyFood("不存在的食物");
    expect(result.category).toBe("other");
    expect(result.storageZone).toBe("fridge");
    expect(result.matched).toBe(false);
  });

  it("空字符串返回 other", () => {
    const result = classifyFood("");
    expect(result.category).toBe("other");
    expect(result.matched).toBe(false);
  });

  it("识别蛋类 - 鸡蛋", () => {
    const result = classifyFood("鸡蛋");
    expect(result.category).toBe("egg");
    expect(result.storageZone).toBe("fridge");
    expect(result.matched).toBe(true);
  });

  it("识别主食 - 面包", () => {
    const result = classifyFood("面包");
    expect(result.category).toBe("grain");
    expect(result.storageZone).toBe("room");
    expect(result.matched).toBe(true);
  });

  it("识别调味品 - 酱油", () => {
    const result = classifyFood("酱油");
    expect(result.category).toBe("condiment");
    expect(result.storageZone).toBe("room");
    expect(result.matched).toBe(true);
  });

  it("识别饮料 - 可乐", () => {
    const result = classifyFood("可乐");
    expect(result.category).toBe("beverage");
    expect(result.storageZone).toBe("fridge");
    expect(result.matched).toBe(true);
  });

  it("识别水果 - 苹果", () => {
    const result = classifyFood("苹果");
    expect(result.category).toBe("fruit");
    expect(result.storageZone).toBe("fridge");
    expect(result.matched).toBe(true);
  });

  // === V1.0.2 关键词优先级测试 ===

  it("三文鱼优先匹配「三文鱼」而非「鱼」", () => {
    const result = classifyFood("三文鱼");
    expect(result.matchedKeyword).toBe("三文鱼");
    expect(result.category).toBe("seafood");
  });

  it("番茄酱优先匹配「番茄酱」而非「番茄」", () => {
    const result = classifyFood("番茄酱");
    expect(result.category).toBe("condiment");
    expect(result.matchedKeyword).toBe("番茄酱");
  });

  it("辣椒酱优先匹配「辣椒酱」而非「辣椒」", () => {
    const result = classifyFood("辣椒酱");
    expect(result.category).toBe("condiment");
    expect(result.matchedKeyword).toBe("辣椒酱");
  });

  it("速冻饺子：同长度关键词取数组先出现的「饺子」", () => {
    const result = classifyFood("速冻饺子");
    // "速冻"(2字) 与 "饺子"(2字) 长度相同，"饺子"在规则库中位置更靠前
    expect(result.matchedKeyword).toBe("饺子");
    expect(result.category).toBe("grain");
  });
});
