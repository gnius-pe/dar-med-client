import {Component, OnInit, OnDestroy} from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit, OnDestroy {

  public currentIndex = 0;
  public slides = [
    {src: 'assets/img/foto-1-min.jpg', alt: 'Slide 1'},
    {src: 'assets/img/foto-2-min.jpg', alt: 'Slide 2'},
    {src: 'assets/img/foto-3-min.jpg', alt: 'Slide 3'},
    {src: 'assets/img/foto-4-min.jpg', alt: 'Slide 4'},
    {src: 'assets/img/foto-5-min.jpg', alt: 'Slide 5'},
  ];

  private slideInterval: any;

  ngOnInit() {
    this.startSlideShow();
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startSlideShow() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }
}
