from django.apps import AppConfig
from sentence_transformers import SentenceTransformer


class ForumConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'forum'

    
    def ready(self):
        import os
        if os.environ.get('DISABLE_MODEL_LOADING') == 'true':
            print("Model loading is disabled.")
            return
        # 在项目启动时加载嵌入模型
        embedding_model = SentenceTransformer(
            'aspire/acge_text_embedding', 
            cache_folder=r'/app/models/sentence_transformers'
        )
        self.embedding_model = embedding_model  # 将模型存储到 AppConfig 实例中
        print("Embedding model loaded successfully!")
    