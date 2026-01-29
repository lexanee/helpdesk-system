// Pagination
export interface PaginationQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  [key: string]: any;
}

// User DTOs
export interface CreateUserDTO {
  email: string;
  password?: string;
  fullName: string;
  roleId: string;
}

export interface UpdateUserDTO {
  email?: string;
  password?: string;
  fullName?: string;
  roleId?: string;
}

// Category DTOs
export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
}

// Priority DTOs
export interface CreatePriorityDTO {
  name: string;
  level: number;
  color: string;
  isDefault?: boolean;
}

export interface UpdatePriorityDTO {
  name?: string;
  level?: number;
  color?: string;
  isDefault?: boolean;
}

// Service DTOs
export interface CreateServiceDTO {
  name: string;
  description?: string;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
}

// Status DTOs
export interface CreateStatusDTO {
  name: string;
  description?: string;
}

export interface UpdateStatusDTO {
  name?: string;
  description?: string;
}

// Role DTOs
export interface CreateRoleDTO {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

// Ticket DTOs
export interface CreateTicketDTO {
  title: string;
  description: string;
  categoryId: string;
  priorityId: string; // Made required based on typical logic, or optional if allowed
  serviceId?: string;
  attachments?: Express.Multer.File[];
}

export interface UpdateTicketDTO {
  title?: string;
  description?: string;
  categoryId?: string;
  statusId?: string;
  priorityId?: string;
  serviceId?: string;
  assignedTo?: string | null;
}

export interface TicketQueryParams extends PaginationQueryParams {
  statusId?: string;
  categoryId?: string;
  assignedTo?: string;
  priorityId?: string;
}

// Message DTOs
export interface CreateMessageDTO {
  ticketId: string;
  userId: string;
  content: string;
  attachments?: Express.Multer.File[];
}
