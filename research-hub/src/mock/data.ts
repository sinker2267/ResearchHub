import type { UserInfo, BlogPost, Resource, Notice, Category, Tag, BlogComment } from '@/types'

// --- Seed Users ---
export const mockUsers: UserInfo[] = [
  {
    id: 1, username: 'admin', displayName: '张教授', email: 'zhang@lab.cn', avatar: '',
    bio: '课题组负责人，从事计算生物学与药物设计研究。', department: '生物信息学实验室', title: '教授',
    roles: [{ id: 1, name: '系统管理员', code: 'admin', description: '', permissions: [] }],
    permissions: ['*'], createdAt: '2025-01-15T08:00:00Z', updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 2, username: 'liming', displayName: '李明', email: 'liming@lab.cn', avatar: '',
    bio: '博士生，研究方向为单细胞组学数据分析。', department: '生物信息学实验室', title: '博士生',
    roles: [{ id: 2, name: '普通用户', code: 'user', description: '', permissions: [] }],
    permissions: ['blog:view', 'blog:create', 'blog:edit', 'resource:view', 'resource:download', 'notice:view'],
    createdAt: '2025-09-01T08:00:00Z', updatedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 3, username: 'wangfang', displayName: '王芳', email: 'wangfang@lab.cn', avatar: '',
    bio: '博士后，从事蛋白质结构预测研究。', department: '结构生物学实验室', title: '博士后',
    roles: [{ id: 2, name: '普通用户', code: 'user', description: '', permissions: [] }],
    permissions: ['blog:view', 'blog:create', 'resource:view', 'resource:download', 'notice:view'],
    createdAt: '2026-02-01T08:00:00Z', updatedAt: '2026-07-01T10:00:00Z',
  },
]

// --- Seed Categories ---
export const mockCategories: Category[] = [
  { id: 1, name: '计算生物学', slug: 'comp-bio', description: '计算方法在生物学中的应用', parentId: null },
  { id: 2, name: '基因组学', slug: 'genomics', description: '基因组数据分析与解读', parentId: null },
  { id: 3, name: '蛋白质科学', slug: 'protein-science', description: '蛋白质结构与功能研究', parentId: null },
  { id: 4, name: '药物设计', slug: 'drug-design', description: '计算机辅助药物设计', parentId: null },
  { id: 5, name: '工具资源', slug: 'tools', description: '科研软件与工具分享', parentId: null },
  { id: 6, name: '实验室动态', slug: 'lab-news', description: '实验室新闻与活动', parentId: null },
]

// --- Seed Tags ---
export const mockTags: Tag[] = [
  { id: 1, name: '深度学习', slug: 'deep-learning', color: '#4c6ef5' },
  { id: 2, name: 'AlphaFold', slug: 'alphafold', color: '#40c057' },
  { id: 3, name: '单细胞', slug: 'single-cell', color: '#fa5252' },
  { id: 4, name: 'CRISPR', slug: 'crispr', color: '#f59f00' },
  { id: 5, name: 'Python', slug: 'python', color: '#339af0' },
  { id: 6, name: 'R语言', slug: 'r-lang', color: '#be4bdb' },
  { id: 7, name: '蛋白质设计', slug: 'protein-design', color: '#40c057' },
  { id: 8, name: '分子动力学', slug: 'md-simulation', color: '#fab005' },
  { id: 9, name: 'RNA-seq', slug: 'rna-seq', color: '#15aabf' },
  { id: 10, name: '数据库', slug: 'database', color: '#7950f2' },
]

// --- Seed Blogs ---
export const mockBlogs: BlogPost[] = [
  {
    id: 1, title: '基于深度学习的蛋白质-配体相互作用预测方法综述',
    slug: 'dl-protein-ligand-review',
    summary: '本文系统综述了近年来基于深度学习的蛋白质-配体相互作用预测方法，包括图神经网络、注意力机制和扩散模型等技术路线，并比较了各方法在基准数据集上的性能表现。',
    content: `## 引言

蛋白质-配体相互作用（PLI）预测是计算机辅助药物设计的核心问题。准确的PLI预测能够显著加速先导化合物的发现和优化过程。

## 方法分类

### 1. 基于序列的方法

DeepDTA等早期工作使用一维卷积神经网络分别编码蛋白质序列和配体SMILES表示。

### 2. 基于图神经网络的方法

将蛋白质表示为氨基酸残基图，配体表示为原子图，通过消息传递机制学习相互作用特征。

\`\`\`python
import torch
import torch.nn as nn

class ProteinLigandGNN(nn.Module):
    def __init__(self, protein_dim, ligand_dim, hidden_dim):
        super().__init__()
        self.protein_encoder = GNNEncoder(protein_dim, hidden_dim)
        self.ligand_encoder = GNNEncoder(ligand_dim, hidden_dim)
        self.interaction_head = nn.Sequential(
            nn.Linear(hidden_dim * 2, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 1)
        )

    def forward(self, protein_graph, ligand_graph):
        protein_emb = self.protein_encoder(protein_graph)
        ligand_emb = self.ligand_encoder(ligand_graph)
        combined = torch.cat([protein_emb, ligand_emb], dim=-1)
        return self.interaction_head(combined)
\`\`\`

### 3. 基于扩散模型的方法

DiffDock等将分子对接建模为扩散过程，在配体构象空间中进行去噪采样。

## 性能比较

| 方法 | PDBBind RMSE | 推理速度 (ms) |
|------|-------------|---------------|
| DeepDTA | 0.145 | 12 |
| GraphDTA | 0.132 | 8 |
| DiffDock | 0.098 | 245 |
| EquiBind | 0.112 | 3 |

## 结论

深度学习方法在PLI预测任务上已超越传统对接方法。未来方向包括：
- 结合物理先验知识的等变网络
- 湿实验反馈的主动学习策略
- 大规模预训练模型的迁移应用`,
    coverImage: '', tags: [mockTags[0], mockTags[1], mockTags[6]],
    category: mockCategories[0], author: mockUsers[0], status: 'published',
    viewCount: 1247, isPinned: false, pinnedAt: null, likeCount: 38, commentCount: 7, isLiked: false, isFavorited: false,
    publishedAt: '2026-07-08T10:30:00Z', createdAt: '2026-07-01T10:30:00Z', updatedAt: '2026-07-08T10:30:00Z',
  },
  {
    id: 2, title: '单细胞RNA测序数据质控最佳实践',
    slug: 'scrna-seq-qc-practices',
    summary: '详细介绍了scRNA-seq数据预处理中的质控步骤，包括双细胞去除、线粒体基因比例过滤和数据标准化方法，并提供了完整的Python分析流程。',
    content: `## 背景

单细胞RNA测序技术已成为研究细胞异质性的重要工具。然而，原始数据中存在大量技术噪声，质控是确保下游分析可靠性的关键步骤。

## 质控指标

### 1. UMI计数分布

每个细胞的UMI总数应呈正态分布。过低的UMI计数可能表示空液滴或破损细胞。

### 2. 线粒体基因比例

高线粒体基因比例（>20%）通常表示细胞损伤或凋亡。

### 3. 双细胞检测

使用Scrublet等工具识别可能的多细胞液滴。

\`\`\`python
import scanpy as sc
import scrublet as scr

# 加载数据
adata = sc.read_10x_mtx('filtered_feature_bc_matrix/')

# 基础过滤
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.filter_genes(adata, min_cells=3)

# 计算质控指标
adata.var['mt'] = adata.var_names.str.startswith('MT-')
sc.pp.calculate_qc_metrics(adata, qc_vars=['mt'], percent_top=None, log1p=False)

# 过滤低质量细胞
adata = adata[adata.obs.n_genes_by_counts < 6000, :]
adata = adata[adata.obs.pct_counts_mt < 20, :]

# 双细胞检测
scrub = scr.Scrublet(adata.X)
doublet_scores, predicted_doublets = scrub.scrub_doublets()
adata.obs['doublet_score'] = doublet_scores
\`\`\`

## 数据标准化

推荐使用SCTransform或scran进行标准化，避免传统log-normalization的偏差。

## 批次效应校正

对于多样本整合分析，推荐使用Harmony或scVI进行批次效应校正。`,
    coverImage: '', tags: [mockTags[2], mockTags[8], mockTags[4]],
    category: mockCategories[1], author: mockUsers[1], status: 'published',
    viewCount: 893, isPinned: false, pinnedAt: null, likeCount: 25, commentCount: 4, isLiked: false, isFavorited: false,
    publishedAt: '2026-07-05T14:20:00Z', createdAt: '2026-06-28T14:20:00Z', updatedAt: '2026-07-05T14:20:00Z',
  },
  {
    id: 3, title: '使用AlphaFold2进行蛋白质结构预测的实用指南',
    slug: 'alphafold2-practical-guide',
    summary: '从环境配置到结果解读，全面介绍如何在本地集群上运行AlphaFold2，包括MMseqs2序列搜索、模板选择和模型置信度评估。',
    content: `## 环境配置

AlphaFold2需要特定的软件环境。推荐使用Docker或Conda进行环境管理。

## 输入准备

\`\`\`bash
# 使用MMseqs2进行序列搜索
mmseqs easy-search input.fasta uniref90_db result.m8 tmp --threads 32

# 运行AlphaFold2
python run_alphafold.py \\
  --fasta_paths=input.fasta \\
  --output_dir=./output \\
  --model_preset=monomer \\
  --db_preset=full_dbs \\
  --max_template_date=2026-06-01
\`\`\`

## 结果解读

### pLDDT评分

- >90: 高置信度，适合功能分析
- 70-90: 骨架正确，侧链可能有误差
- 50-70: 低置信度，仅作参考
- <50: 无序区域

### PAE图解读

PAE（Predicted Aligned Error）矩阵反映结构域间的相对位置不确定性。

## 常见问题

1. **GPU内存不足**：使用--model_preset=monomer_ptm可减少内存占用
2. **序列搜索过慢**：使用--db_preset=reduced_dbs进行快速预测
3. **多聚体预测**：需指定--model_preset=multimer`,
    coverImage: '', tags: [mockTags[1], mockTags[6], mockTags[7]],
    category: mockCategories[2], author: mockUsers[2], status: 'published',
    viewCount: 1562, isPinned: false, pinnedAt: null, likeCount: 42, commentCount: 9, isLiked: false, isFavorited: false,
    publishedAt: '2026-07-01T09:15:00Z', createdAt: '2026-06-20T09:15:00Z', updatedAt: '2026-07-01T09:15:00Z',
  },
  {
    id: 4, title: '分子动力学模拟中的增强采样方法',
    slug: 'enhanced-sampling-md',
    summary: '介绍Metadynamics、REMD和GaMD等增强采样方法的原理与应用，帮助克服传统MD模拟中的时间尺度限制问题。',
    content: `## 为什么需要增强采样

传统分子动力学模拟受限于微秒至毫秒级的时间尺度，而许多生物学过程（如蛋白质折叠、配体结合/解离）发生在毫秒至秒级别。

## 主要方法

### Metadynamics

通过添加高斯势能来填充自由能面，加速构象采样。

### Replica Exchange MD (REMD)

多副本在不同温度下并行模拟，通过副本交换跨越能垒。

### Gaussian Accelerated MD (GaMD)

无需预定义集合变量的增强采样方法，适用于复杂生物体系。`,
    coverImage: '', tags: [mockTags[7], mockTags[6]],
    category: mockCategories[3], author: mockUsers[0], status: 'published',
    viewCount: 634, isPinned: false, pinnedAt: null, likeCount: 16, commentCount: 2, isLiked: false, isFavorited: false,
    publishedAt: '2026-06-28T16:40:00Z', createdAt: '2026-06-20T16:40:00Z', updatedAt: '2026-06-28T16:40:00Z',
  },
  {
    id: 5, title: 'CRISPR-Cas9脱靶效应预测工具比较',
    slug: 'crispr-off-target-tools',
    summary: '横向对比CRISPOR、CRISPResso2、Cas-OFFinder等主流脱靶预测工具的性能与适用范围。',
    content: `## 引言

CRISPR-Cas9基因编辑技术已广泛应用于基础研究和临床前试验。然而，脱靶效应是影响其安全性的关键因素。

## 工具比较

### CRISPOR

基于CFD评分的脱靶预测，支持多种Cas酶变体。

### CRISPResso2

提供从原始测序数据到编辑结果可视化的完整流程。

### Cas-OFFinder

快速全基因组脱靶位点搜索，支持任意PAM序列。`,
    coverImage: '', tags: [mockTags[3], mockTags[0], mockTags[9]],
    category: mockCategories[0], author: mockUsers[1], status: 'published',
    viewCount: 445, isPinned: false, pinnedAt: null, likeCount: 11, commentCount: 1, isLiked: false, isFavorited: false,
    publishedAt: '2026-06-25T11:00:00Z', createdAt: '2026-06-18T11:00:00Z', updatedAt: '2026-06-25T11:00:00Z',
  },
  {
    id: 6, title: 'AlphaFold3最新功能解读与应用展望',
    slug: 'alphafold3-features',
    summary: 'AlphaFold3扩展了对所有生物分子（蛋白质、DNA、RNA、配体、离子）的复合物结构预测能力，本文分析其架构改进与潜在应用场景。',
    content: `## AlphaFold3的新特性

AlphaFold3是DeepMind在2024年发布的突破性模型，相比AlphaFold2有质的飞跃。

## 关键改进

1. **全原子扩散模型**：直接从原始原子坐标出发，无需预先定义残基框架
2. **通用生物分子**：支持蛋白质、核酸、小分子、离子及修饰残基
3. **Pairformer模块**：替代Evoformer，更高效的信息传递

## 应用前景

AlphaFold3将加速以下领域的研究：
- 蛋白质-药物相互作用预测
- 蛋白质工程与设计
- 翻译后修饰的结构效应研究
- 抗体-抗原复合物建模`,
    coverImage: '', tags: [mockTags[1], mockTags[6], mockTags[0]],
    category: mockCategories[2], author: mockUsers[0], status: 'published',
    viewCount: 2103, isPinned: false, pinnedAt: null, likeCount: 67, commentCount: 12, isLiked: false, isFavorited: false,
    publishedAt: '2026-07-09T08:30:00Z', createdAt: '2026-07-09T08:30:00Z', updatedAt: '2026-07-09T08:30:00Z',
  },
]

// --- Seed Resources ---
export const mockResources: Resource[] = [
  {
    id: 101, title: 'Human Protein Atlas v23 数据集', slug: 'hpa-v23',
    description: '人类蛋白质表达图谱数据，包含44种组织类型、20000+蛋白质的免疫组化、RNA表达和亚细胞定位信息。格式为HDF5和CSV。',
    type: 'dataset', category: mockCategories[1],
    tags: [mockTags[9], mockTags[3]],
    files: [
      { id: 1001, filename: 'hpa_v23_normal_tissue.h5', size: 2.4 * 1024 * 1024 * 1024, md5: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', mimeType: 'application/x-hdf5', downloadCount: 342, createdAt: '2026-06-15T10:00:00Z' },
      { id: 1002, filename: 'hpa_v23_rna_expression.csv', size: 856 * 1024 * 1024, md5: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7', sha256: '6e340b9cffb37a989ca544e6bb780a2c78901d3fb33738768511a30617afa01d', mimeType: 'text/csv', downloadCount: 218, createdAt: '2026-06-15T10:00:00Z' },
    ],
    versions: [
      { id: 1, version: 'v23.0', changelog: '新增3种组织类型，更新抗体验证数据', files: [], createdAt: '2026-06-15T10:00:00Z' },
      { id: 2, version: 'v22.1', changelog: '修复RNA-seq批次效应', files: [], createdAt: '2026-02-01T10:00:00Z' },
    ],
    author: mockUsers[0], license: 'CC BY-SA 4.0',
    citation: 'Uhlén M et al. (2026) Tissue-based map of the human proteome. Science.',
    viewCount: 1890, isPinned: false, pinnedAt: null, downloadCount: 560, likeCount: 45, isLiked: false, isFavorited: false,
    status: 'published', createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 102, title: 'MolDock Pro — 分子对接分析工具包', slug: 'moldock-pro',
    description: '基于PyTorch的高性能分子对接工具，支持GPU加速的蛋白质-配体对接、结合自由能计算和对接结果可视化。内置AlphaFold2结构预测接口。',
    type: 'software', category: mockCategories[4],
    tags: [mockTags[4], mockTags[7], mockTags[1]],
    files: [
      { id: 2001, filename: 'moldock_pro_v2.1.0_linux.tar.gz', size: 156 * 1024 * 1024, md5: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', sha256: 'd7b8c9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c', mimeType: 'application/gzip', downloadCount: 128, createdAt: '2026-07-01T10:00:00Z' },
    ],
    versions: [
      { id: 3, version: 'v2.1.0', changelog: '添加AlphaFold3 API支持，优化GPU内存占用', files: [], createdAt: '2026-07-01T10:00:00Z' },
      { id: 4, version: 'v2.0.0', changelog: '重构为PyTorch 2.0，新增可视化模块', files: [], createdAt: '2026-03-15T10:00:00Z' },
    ],
    author: mockUsers[1], license: 'MIT',
    citation: 'Li M et al. (2026) MolDock Pro: GPU-accelerated molecular docking toolbox. J. Chem. Inf. Model.',
    viewCount: 987, isPinned: false, pinnedAt: null, downloadCount: 128, likeCount: 23, isLiked: false, isFavorited: false,
    status: 'published', createdAt: '2026-07-01T10:00:00Z', updatedAt: '2026-07-01T10:00:00Z',
  },
  {
    id: 103, title: 'scRNA-seq Benchmark 数据集', slug: 'scrna-benchmark',
    description: '包含10x Genomics、Smart-seq2和Drop-seq平台的人外周血PBMC单细胞测序数据，用于方法学评估和基准测试。',
    type: 'dataset', category: mockCategories[1],
    tags: [mockTags[2], mockTags[8], mockTags[5]],
    files: [
      { id: 3001, filename: 'pbmc_10x_v3_filtered.h5ad', size: 1.2 * 1024 * 1024 * 1024, md5: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9', sha256: 'c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9', mimeType: 'application/octet-stream', downloadCount: 456, createdAt: '2026-05-20T10:00:00Z' },
    ],
    versions: [
      { id: 5, version: 'v2.0', changelog: '增加Smart-seq2平台数据，统一注释格式', files: [], createdAt: '2026-05-20T10:00:00Z' },
    ],
    author: mockUsers[2], license: 'CC BY 4.0',
    citation: 'Wang F et al. (2026) A benchmark dataset for scRNA-seq method evaluation. Sci. Data.',
    viewCount: 2341, isPinned: false, pinnedAt: null, downloadCount: 456, likeCount: 34, isLiked: false, isFavorited: false,
    status: 'published', createdAt: '2026-05-20T10:00:00Z', updatedAt: '2026-05-20T10:00:00Z',
  },
]

// --- Seed Notices ---
export const mockNotices: Notice[] = [
  {
    id: 201, title: '计算集群GPU节点维护通知', content: '将于7月12日（周六）凌晨2:00-6:00对GPU计算节点进行维护升级，届时相关计算任务将暂停。请提前保存运行中的作业。',
    type: 'system', level: 'warning', isRead: false, publisher: mockUsers[0],
    publishedAt: '2026-07-10T06:00:00Z', createdAt: '2026-07-10T06:00:00Z',
  },
  {
    id: 202, title: '实验室安全培训安排', content: '定于7月15日下午2:00在生物楼301会议室举行实验室安全培训，请全体成员准时参加。',
    type: 'announcement', level: 'important', isRead: false, publisher: mockUsers[0],
    publishedAt: '2026-07-09T12:00:00Z', createdAt: '2026-07-09T12:00:00Z',
  },
  {
    id: 203, title: '新版ResearchHub平台上线', content: '课题组知识管理平台ResearchHub已正式部署上线。支持博客分享、资源管理、数据集共享等功能。欢迎各位同学使用并反馈建议。',
    type: 'announcement', level: 'info', isRead: true, publisher: mockUsers[0],
    publishedAt: '2026-07-01T09:00:00Z', createdAt: '2026-07-01T09:00:00Z',
  },
  {
    id: 204, title: '2026年暑期组会安排', content: '暑期组会调整为每周四下午3:00，地点不变。请各小组提前准备进展汇报。',
    type: 'announcement', level: 'info', isRead: true, publisher: mockUsers[1],
    publishedAt: '2026-06-28T08:00:00Z', createdAt: '2026-06-28T08:00:00Z',
  },
  {
    id: 205, title: '数据库资源更新', content: 'PDBbind 2026版本数据已同步至服务器，路径为 /data/databases/pdbbind/v2026/。包含新的蛋白质-配体复合物结构及结合亲和力数据。',
    type: 'system', level: 'info', isRead: true, publisher: mockUsers[0],
    publishedAt: '2026-06-20T10:00:00Z', createdAt: '2026-06-20T10:00:00Z',
  },
]

// --- Seed Comments ---
export const mockComments: Record<number, BlogComment[]> = {
  1: [
    { id: 5001, blogId: 1, content: '非常全面的综述！关于扩散模型部分，可以补充一下DiffDock和TankBind的详细对比。', author: mockUsers[1], parentId: null, replies: [], createdAt: '2026-07-09T10:00:00Z' },
    { id: 5002, blogId: 1, content: 'GraphDTA在我们的数据集上表现确实不错，但特征工程比较关键。', author: mockUsers[2], parentId: null, replies: [], createdAt: '2026-07-09T14:00:00Z' },
    { id: 5003, blogId: 1, content: '建议补充，已有许多工作证明3D结构信息对PLI预测至关重要。', author: mockUsers[0], parentId: 5001, replies: [], createdAt: '2026-07-09T15:00:00Z' },
  ],
  3: [
    { id: 5004, blogId: 3, content: 'MMseqs2确实比BLAST快很多，我们组都已经全面切换了。', author: mockUsers[1], parentId: null, replies: [], createdAt: '2026-07-02T11:00:00Z' },
    { id: 5005, blogId: 3, content: '请问多聚体预测时，GPU内存大概需要多少？', author: mockUsers[2], parentId: null, replies: [], createdAt: '2026-07-02T16:00:00Z' },
  ],
  6: [
    { id: 5006, blogId: 6, content: 'AF3确实令人兴奋，不过目前只有通过服务器才能使用对吧？', author: mockUsers[1], parentId: null, replies: [], createdAt: '2026-07-09T12:00:00Z' },
  ],
}
