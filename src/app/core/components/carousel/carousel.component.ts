import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit, OnDestroy {

  public currentIndex = 0;
  public slides = [
    { src: 'assets/img/carousel-1.webp', alt: 'Slide 1' },
    { src: 'assets/img/carousel-2.webp', alt: 'Slide 2' },
    { src: 'assets/img/carousel-3.webp', alt: 'Slide 3' }
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
