import { Component, OnInit } from '@angular/core';
import {Post} from '../../models/Post';
import {User} from '../../models/Users';
import {UserService} from '../../service/user.service';
import {PostService} from '../../service/post.service';
import {CommentService} from '../../service/comment.service';
import {ImageUploadService} from '../../service/image-upload.service';
import {NotificationService} from '../../service/notification.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  isPostsLoaded = false;
  posts: Post[];
  isDataLoaded = false;
  user: User;

  constructor(private userService: UserService,
              private postService: PostService,
              private commentService: CommentService,
              private imageService: ImageUploadService,
              private notification: NotificationService) {
  }

  /* Данные, полученные из Базы Данных, помещаются в data и дальше происходит с ними работа */
  ngOnInit(): void {
    this.postService.getAllPosts()
      .subscribe(data => {
        this.posts = data;
        this.getCommentsToPosts(this.posts);
        this.getImagesToPosts(this.posts);
        this.isPostsLoaded = true;
      });

    this.userService.getCurrentUser()
      .subscribe(data => {
        this.user = data;
        this.isDataLoaded = true;
      });
  }

  getImagesToPosts(posts: Post[]): void {
    posts.forEach(p => {
      this.imageService.getImageToPost(p.id)
        .subscribe(data => {
          p.image = data.imageBytes;
        });
    });
  }

  getCommentsToPosts(posts: Post[]): void {
    posts.forEach(p => {
      this.commentService.getCommentsToPost(p.id)
        .subscribe((data: any) => {
          p.comments = data;
        });
    });
  }

  likePost(postId: number, postIndex: number): void {
    const post = this.posts[postIndex];

    if (!post.usersLiked.includes(this.user.username)) {
      this.postService.likePost(postId, this.user.username)
        .subscribe(() => {
          post.usersLiked.push(this.user.username);
          this.notification.showSnackBar('Liked!');
        });
    } else {
      this.postService.likePost(postId, this.user.username)
        .subscribe(() => {
          const index = post.usersLiked.indexOf(this.user.username, 0);
          if (index > -1) {
            post.usersLiked.splice(index, 1);
          }
        });
    }
  }

  postComment(message: any, postId: number, postIndex: number): void {
    const post = this.posts[postIndex];

    this.commentService.addCommentToPost(postId, message)
      .subscribe(data => {
        post.comments.push(data);
      });
  }

  formatImage(img: any): any {
    if (img == null) {
      return null;
    }
    return 'data:image/jpeg;base64,' + img;
  }
}
