package com.finviet.app.category;

import com.finviet.app.common.BusinessException;
import com.finviet.app.security.CurrentUser;
import com.finviet.app.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public List<Response> list() {
        UserAccount u = CurrentUser.get();
        return categoryRepository.findByUserOrSystemTrueOrderByNameViAsc(u).stream()
                .map(Response::from).toList();
    }

    @PostMapping
    public Response create(@Valid @RequestBody CreateRequest req) {
        UserAccount u = CurrentUser.get();
        Category c = Category.builder()
                .user(u)
                .code(req.getCode() == null ? "USR_" + System.currentTimeMillis() : req.getCode())
                .nameVi(req.getNameVi()).nameEn(req.getNameEn() == null ? req.getNameVi() : req.getNameEn())
                .icon(req.getIcon()).color(req.getColor())
                .kind(req.getKind()).system(false).build();
        return Response.from(categoryRepository.save(c));
    }

    @PutMapping("/{id}")
    public Response update(@PathVariable UUID id, @RequestBody CreateRequest req) {
        UserAccount u = CurrentUser.get();
        Category c = categoryRepository.findByIdAndUser(id, u)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy danh mục"));
        if (c.isSystem()) throw new BusinessException("Không thể sửa danh mục hệ thống");
        if (req.getNameVi() != null) c.setNameVi(req.getNameVi());
        if (req.getNameEn() != null) c.setNameEn(req.getNameEn());
        if (req.getIcon() != null) c.setIcon(req.getIcon());
        if (req.getColor() != null) c.setColor(req.getColor());
        if (req.getKind() != null) c.setKind(req.getKind());
        return Response.from(categoryRepository.save(c));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UserAccount u = CurrentUser.get();
        Category c = categoryRepository.findByIdAndUser(id, u)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy danh mục"));
        if (c.isSystem()) throw new BusinessException("Không thể xóa danh mục hệ thống");
        categoryRepository.delete(c);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class CreateRequest {
        private String code;
        @NotBlank private String nameVi;
        private String nameEn;
        @NotNull private Category.Kind kind;
        private String icon;
        private String color;
    }

    @Data
    public static class Response {
        private String id;
        private String code;
        private String nameVi;
        private String nameEn;
        private String kind;
        private String icon;
        private String color;
        private boolean system;

        public static Response from(Category c) {
            Response r = new Response();
            r.id = c.getId().toString();
            r.code = c.getCode();
            r.nameVi = c.getNameVi();
            r.nameEn = c.getNameEn();
            r.kind = c.getKind().name();
            r.icon = c.getIcon();
            r.color = c.getColor();
            r.system = c.isSystem();
            return r;
        }
    }
}
