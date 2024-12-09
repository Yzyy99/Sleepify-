# forum/utils.py
import numpy as np

def batch_calculate_similarities(user_embedding, post_embeddings):
    """
    批量计算用户嵌入向量和所有帖子嵌入向量的余弦相似度
    """
    user_embedding = np.array(user_embedding)
    post_embeddings = np.array(post_embeddings)

    if post_embeddings.size == 0:
        return np.array([])

    dot_products = np.dot(post_embeddings, user_embedding)
    user_norm = np.linalg.norm(user_embedding)
    post_norms = np.linalg.norm(post_embeddings, axis=1)
    post_norms[post_norms == 0] = 1e-10

    similarities = dot_products / (post_norms * user_norm)
    return similarities