from django.core.management.base import BaseCommand
from forum.models import ForumPost
import datetime

class Command(BaseCommand):
    help = "删除指定 ID 的帖子，或删除 15 天前的帖子。"

    def add_arguments(self, parser):
        # 添加参数：帖子 ID 列表或删除 15 天前的帖子
        parser.add_argument(
            '--ids',
            type=int,
            nargs='+',  # 接受多个 ID
            help='指定要删除的帖子 ID（可以传入多个）。'
        )
        parser.add_argument(
            '--days',
            type=int,
            default=15,
            help='删除指定天数之前的帖子，默认为 15 天。'
        )

    def handle(self, *args, **options):
        post_ids = options['ids']
        days = options['days']

        if post_ids:
            # 删除指定 ID 的帖子
            self.stdout.write(f"准备删除帖子 ID: {', '.join(map(str, post_ids))}")
            posts_to_delete = ForumPost.objects.filter(postid__in=post_ids)

            if not posts_to_delete.exists():
                self.stdout.write(self.style.ERROR("没有找到对应的帖子。"))
            else:
                count, _ = posts_to_delete.delete()
                self.stdout.write(self.style.SUCCESS(f"成功删除 {count} 篇帖子。"))

        else:
            # 删除指定天数之前的帖子（默认 15 天前）
            cutoff_date = datetime.datetime.now() - datetime.timedelta(days=days)
            self.stdout.write(f"准备删除 {days} 天前的帖子（截止时间: {cutoff_date}）。")

            posts_to_delete = ForumPost.objects.filter(created_at__lt=cutoff_date)

            if not posts_to_delete.exists():
                self.stdout.write(self.style.SUCCESS("没有符合条件的帖子需要删除。"))
            else:
                count, _ = posts_to_delete.delete()
                self.stdout.write(self.style.SUCCESS(f"成功删除 {count} 篇帖子。"))

        self.stdout.write(self.style.SUCCESS("删除操作已完成。"))