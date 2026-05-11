# validateClassCode

CloudBase 云函数，用于校验学生输入的私有班级码。

## 数据库集合

集合名：`classes`

示例记录：

```json
{
  "classCode": "YOUR_PRIVATE_CLASS_CODE",
  "className": "你的班级名称",
  "active": true,
  "createdAt": "2026-05-10T00:00:00.000Z"
}
```

## 安全边界

- 前端不直接读取 `classes` 集合。
- 前端不包含真实班级码列表。
- 云函数只校验输入的单个班级码，不提供创建、修改、删除或列出班级码接口。

## 前端环境变量

生产环境设置：

```bash
VITE_CLASS_CODE_VALIDATE_URL=https://你的-cloudbase-http-云函数地址
```
