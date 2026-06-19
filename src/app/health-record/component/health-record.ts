import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { HealthRecordRow } from '../health-record.model';
import HealthRecordService from '../health-record.service';
import ToastService from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-health-record',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './health-record.html',
  styleUrls: ['./health-record.css']
})
export class HealthRecord implements OnInit {
  records = signal<HealthRecordRow[]>([]);
  isLoading = signal<boolean>(false);
  activeMenuRecordId = signal<string | null>(null);

  // Async Inline Expanded Drawer Specific State Trackers
  expandedRecordId = signal<string | null>(null);
  isDetailsLoading = signal<boolean>(false);
  activeExpandedRecord = signal<any | null>(null);

  // Query Constraints Parameters
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);

  // Reactive Form Input Controls
  searchControl = new FormControl('');
  fromDate = signal<string>('');
  toDate = signal<string>('');

  totalPages = signal<number>(1);
  totalRecords = signal<number>(0);

  private destroyRef = inject(DestroyRef);

  constructor(
    private healthRecordService: HealthRecordService,
    private toastService: ToastService
  ) {
    this.initializeDefaultDates();
  }

  ngOnInit(): void {
    // Initial data hydration load sequence
    this.loadHealthrecordsRegistry(this.currentPage(), this.searchControl.value || '');

    // Setup elegant RxJS debounced global search streams pipeline
    this.searchControl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading.set(true);
        this.currentPage.set(1);
        this.activeMenuRecordId.set(null);
        this.expandedRecordId.set(null);
      }),
      switchMap(query => {
        const queryFilters = this.buildQueryFilters(query || '');
        return this.healthRecordService.getAllHealthRecords(queryFilters, 1, this.itemsPerPage());
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res: any) => {
        this.records.set(res.data.records || []);
        this.totalPages.set(res.data.pagination.totalPages || 1);
        this.totalRecords.set(res.data.pagination.totalRecords || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Global search routing exception.');
        this.isLoading.set(false);
      }
    });
  }

  private initializeDefaultDates() {
    const local = new Date();
    const offset = local.getTimezoneOffset();
    const todayLocal = new Date(local.getTime() - (offset * 60 * 1000));
    const todayStr = todayLocal.toISOString().substring(0, 10);

    this.fromDate.set(todayStr);
    this.toDate.set(todayStr);
  }

  /**
   * Evaluates input conditions and structures the filter payload.
   * If a search query exists, date parameters are omitted for global lookup.
   */
  private buildQueryFilters(search: string): any {
    const filters: any = {};
    if (search.trim()) {
      filters.search = search.trim();
    } else {
      filters.fromDate = this.fromDate();
      filters.toDate = this.toDate();
    }
    return filters;
  }

  loadHealthrecordsRegistry(page: number, search: string) {
    this.isLoading.set(true);
    this.activeMenuRecordId.set(null);
    this.expandedRecordId.set(null);

    const queryFilters = this.buildQueryFilters(search);

    this.healthRecordService.getAllHealthRecords(queryFilters, page, this.itemsPerPage()).subscribe({
      next: (res: any) => {
        this.records.set(res.data.records || []);
        this.totalPages.set(res.data.pagination.totalPages || 1);
        this.totalRecords.set(res.data.pagination.totalRecords || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to parse database registries.');
        this.isLoading.set(false);
      }
    });
  }

  triggerChartExpansion(customRecordId: string) {
    const targetRecord = this.records().find(r => r.healthrecordId === customRecordId);
    if (!targetRecord) return;

    this.closeDropdowns();

    if (this.expandedRecordId() === targetRecord._id) {
      this.expandedRecordId.set(null);
      this.activeExpandedRecord.set(null);
      return;
    }

    this.expandedRecordId.set(targetRecord._id);
    this.isDetailsLoading.set(true);
    this.activeExpandedRecord.set(null);

    this.healthRecordService.getRecordById(customRecordId).subscribe({
      next: (res: any) => {
        this.activeExpandedRecord.set(res.data || res);
        this.isDetailsLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load comprehensive record payload.');
        this.isDetailsLoading.set(false);
        this.expandedRecordId.set(null);
      }
    });
  }

  onDateRangeChange(newDate: string) {
    if (!newDate) return;
    this.fromDate.set(newDate);
    this.toDate.set(newDate);

    // Reset active search text when users focus back on date-restricted criteria
    this.searchControl.setValue('', { emitEvent: false });
    this.currentPage.set(1);
    this.loadHealthrecordsRegistry(1, '');
  }

  toggleOptionsMenu(event: Event, recordId: string) {
    event.stopPropagation();
    this.activeMenuRecordId.update(current => current === recordId ? null : recordId);
  }

  closeDropdowns(): void {
    this.activeMenuRecordId.set(null);
  }

  onPageChange(targetPage: number) {
    if (targetPage < 1 || targetPage > this.totalPages()) return;
    this.currentPage.set(targetPage);
    this.loadHealthrecordsRegistry(targetPage, this.searchControl.value || '');
  }
}