# Pull Request 标准格式提案

为了提高团队协作效率和代码评审质量，我们需要统一 Pull Request（PR）的提交格式。以下是 PR 的标准格式和要求，请大家参考并提出意见。

---

## **Pull Request 标准格式**

### **1. 标题格式**
标题应 **简洁明了**，以动词开头，准确描述 PR 的目的和主要内容。  
推荐格式：`<类型>: <简要描述>`。

#### **标题类型示例**：
- **feat**：用于新功能开发。
  - 示例：`feat: 完成注册功能的前后端联动`
- **fix**：用于修复问题或 bug。
  - 示例：`fix: 修复注册接口中用户名校验问题`
- **refactor**：用于代码重构（功能不变）。
  - 示例：`refactor: 优化用户认证逻辑`
- **docs**：用于文档更新。
  - 示例：`docs: 更新注册 API 使用文档`
- **test**：用于测试相关代码。
  - 示例：`test: 添加注册功能的单元测试`

---

### **2. 描述内容**
Pull Request 的描述部分需要详细说明 PR 的背景、目的、变更内容和测试情况，主要包含以下几点：

#### **描述模板**：


#### 目的
简要说明该 PR 的背景和动机，例如：
- 完善注册功能，支持前后端联动。
- 修复登录接口的错误响应问题。

#### 变更内容
请详细列出 PR 中的主要修改内容：
1. 实现了后端 `register API`，支持用户注册功能。
2. 前端完成了注册页面与后端的联动功能。
3. 新增了注册和登录的错误提示逻辑。

#### 相关 Issue
关联的 Issue 编号（如果有）。  
示例：`Closes #12`

#### 测试情况
简要描述测试结果：
- 本地测试通过。
- 已使用 Postman 调试接口，结果正常。
- 已通过开发环境的接口联调。

#### 影响范围
说明本次提交对其他模块或功能的影响，例如：
- 可能影响用户认证模块，请注意后续测试。


### **3. 提交要求**
请确保每次提交的 Pull Request 符合以下要求：

1. **分支结构**：所有 PR 应提交到正确的目标分支（如 `develop`）。
2. **代码风格**：遵循团队的代码风格规范（如 Prettier/ESLint）。
3. **测试通过**：代码必须通过所有单元测试和 CI 检查。
4. **必要文档**：如果涉及新功能或接口修改，请更新相关文档。

### **4. 推荐格式示例**

**标题**：  
`feat: 完成注册功能的前后端联动`

**描述**：


### 目的
完善用户注册功能，完成前后端联动，支持用户通过页面完成注册。

### 变更内容
1. 实现了后端 `register API`，支持用户名、密码的注册功能。
2. 在前端完成了注册页面的交互逻辑，调用后端接口完成用户注册。
3. 增加了注册失败时的错误提示处理。

### 相关 Issue
Closes #12

### 测试情况
- 本地通过了注册功能的手动测试。
- 使用 Postman 调试接口，测试通过。
- 已在开发环境完成接口联调。

### 影响范围
- 用户认证模块可能受到影响，请注意回归测试。


## **为什么需要规范 PR 格式？**
- **提高代码评审效率**：清晰的标题和描述可以让评审者快速理解 PR 的目的和变更内容。
- **便于追踪问题**：通过关联 Issue 和详细描述，方便后续排查问题。
- **减少沟通成本**：通过描述清楚变更的目的和测试情况，减少不必要的沟通。
- **保证代码质量**：通过明确测试和影响范围，降低引入新问题的风险。

---

## **讨论**
请在本 Issue 中提出对 PR 标准格式的意见或建议。如果没有问题，我们将把此标准写入项目的贡献指南（`CONTRIBUTING.md`）或 Pull Request 模板中。

---

## **后续步骤**
1. 将最终确定的 Pull Request 标准格式添加到项目的 `CONTRIBUTING.md` 文件中。
2. 创建 Pull Request 模板文件（`PULL_REQUEST_TEMPLATE.md`）以自动应用此格式。

---


**通过规范 PR 提交流程，我们可以更高效地协作并保证代码质量！** 😊