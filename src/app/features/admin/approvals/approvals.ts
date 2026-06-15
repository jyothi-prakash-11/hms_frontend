import { Component, OnInit, signal } from '@angular/core';
import { Approval } from './approvals.models';
import { ApprovalService } from './approvals.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-approvals',
  imports: [CommonModule],
  templateUrl: './approvals.html',
  styleUrl: './approvals.css',
})
export class Approvals implements OnInit {
  approvals = signal<Approval[]>([]);
  expandedApprovalId = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  constructor(private approvalService: ApprovalService) { }
  ngOnInit(): void {
    this.loadApprovals();
  }
  loadApprovals() {
    this.approvalService.getAllApproval().subscribe({
      next: (res) => {
        this.approvals.set(res.data);
      }
    });
  }
  toggleApproval(id: string) {
    if (this.expandedApprovalId() === id) {
      this.expandedApprovalId.set(null);
      return;
    }
    this.expandedApprovalId.set(id);
  }
  onApprove(id: string) {
    this.approvalService.approveRequest(id).subscribe({
      next: (res) => {
        console.log(res);
        this.approvals.update(
          approvals => approvals.filter(approval => approval._id !== id)
        );
        this.successMessage.set('approves sucessfully ');
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
        this.expandedApprovalId.set(null);
      }
    });
  }
  onReject(id: string) {
    this.approvalService.rejectApproval(id).subscribe({
      next: (res) => {
        this.successMessage.set('approvalrequest rejected ');
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
        this.expandedApprovalId.set(null);
      }
    });
  }
}
